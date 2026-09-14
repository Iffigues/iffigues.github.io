package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"sort"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"golang.org/x/sync/singleflight"
)

type GitHubSearchResponse struct {
	TotalCount int          `json:"total_count"`
	Items      []GitHubRepo `json:"items"`
}

type GitHubRepo struct {
	Name  string `json:"name"`
	Owner Owner  `json:"owner"`
}

type Owner struct {
	Login string `json:"login"`
}

type GitHubErrorResponse struct {
	Message string `json:"message"`
	Errors  []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

type APIResponse struct {
	TotalResults int      `json:"total_results"`
	TotalPages   int      `json:"total_pages"`
	CurrentPage  int      `json:"current_page"`
	PerPage      int      `json:"per_page"`
	NextPage     *int     `json:"next_page"`
	PrevPage     *int     `json:"prev_page"`
	PagesURLs    []string `json:"pages_urls"`
}

// Structs pour le cache d'API
type cacheItem struct {
	data      []byte
	etag      string
	expiredAt time.Time
}

type MemoryCache struct {
	mu    sync.RWMutex
	items map[string]cacheItem
}

func NewMemoryCache(cleanupInterval time.Duration) *MemoryCache {
	c := &MemoryCache{
		items: make(map[string]cacheItem),
	}
	go c.startCleanup(cleanupInterval)
	return c
}

func (c *MemoryCache) Get(key string) (cacheItem, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[key]
	if !found {
		return cacheItem{}, false
	}
	return item, true
}

func (c *MemoryCache) Set(key string, data []byte, etag string, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = cacheItem{
		data:      data,
		etag:      etag,
		expiredAt: time.Now().Add(ttl),
	}
}

func (c *MemoryCache) startCleanup(interval time.Duration) {
	ticker := time.NewTicker(interval)
	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		deletedCount := 0
		for k, v := range c.items {
			if now.After(v.expiredAt) {
				delete(c.items, k)
				deletedCount++
			}
		}
		c.mu.Unlock()
		if deletedCount > 0 {
			slog.Debug("Nettoyage du cache de recherche", slog.Int("items_purged", deletedCount))
		}
	}
}

// Cache Négatif (Stockage du statut 200/404 des URLs)
type URLStatusCache struct {
	mu    sync.RWMutex
	items map[string]urlCacheItem
}

type urlCacheItem struct {
	isLive    bool
	expiredAt time.Time
}

func NewURLStatusCache(cleanupInterval time.Duration) *URLStatusCache {
	c := &URLStatusCache{
		items: make(map[string]urlCacheItem),
	}
	go c.startCleanup(cleanupInterval)
	return c
}

func (c *URLStatusCache) Get(url string) (bool, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[url]
	if !found || time.Now().After(item.expiredAt) {
		return false, false
	}
	return item.isLive, true
}

func (c *URLStatusCache) Set(url string, isLive bool, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[url] = urlCacheItem{
		isLive:    isLive,
		expiredAt: time.Now().Add(ttl),
	}
}

func (c *URLStatusCache) startCleanup(interval time.Duration) {
	ticker := time.NewTicker(interval)
	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		deletedCount := 0
		for k, v := range c.items {
			if now.After(v.expiredAt) {
				delete(c.items, k)
				deletedCount++
			}
		}
		c.mu.Unlock()
		if deletedCount > 0 {
			slog.Debug("Nettoyage du cache d'URLs", slog.Int("urls_purged", deletedCount))
		}
	}
}

// Circuit Breaker
type CircuitBreaker struct {
	mu           sync.Mutex
	failures     int
	threshold    int
	openUntil    time.Time
	cooldownTime time.Duration
}

func NewCircuitBreaker(threshold int, cooldown time.Duration) *CircuitBreaker {
	return &CircuitBreaker{
		threshold:    threshold,
		cooldownTime: cooldown,
	}
}

func (cb *CircuitBreaker) Allow() bool {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	if cb.failures >= cb.threshold {
		if time.Now().Before(cb.openUntil) {
			return false
		}
		cb.failures = 0
		slog.Info("Circuit Breaker réarmé (fermé)")
	}
	return true
}

func (cb *CircuitBreaker) RecordFailure() {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	cb.failures++
	slog.Warn("Échec enregistré dans le Circuit Breaker",
		slog.Int("failures", cb.failures),
		slog.Int("threshold", cb.threshold),
	)

	if cb.failures >= cb.threshold {
		cb.openUntil = time.Now().Add(cb.cooldownTime)
		slog.Error("Circuit Breaker déclenché : suspension des requêtes GitHub",
			slog.Duration("cooldown", cb.cooldownTime),
			slog.Time("open_until", cb.openUntil),
		)
	}
}

func (cb *CircuitBreaker) RecordSuccess() {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	if cb.failures > 0 {
		slog.Info("Réinitialisation des échecs du Circuit Breaker après succès")
	}
	cb.failures = 0
}

// Erreur personnalisée pour le statut 422
type InvalidQueryError struct {
	Message string
}

func (e *InvalidQueryError) Error() string {
	return e.Message
}

// Variables globales
var (
	httpClient           = createOptimizedClient()
	searchCache          = NewMemoryCache(10 * time.Minute)
	urlCache             = NewURLStatusCache(5 * time.Minute)
	globalConcurrencySem = make(chan struct{}, 50)
	requestGroup         singleflight.Group
	cb                   = NewCircuitBreaker(5, 1*time.Minute)
)

func main() {
	// Configuration du logger structuré en JSON
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: corsMiddleware(handleSearch),
	}

	go func() {
		slog.Info("Serveur HTTP démarré", slog.String("port", port))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Erreur critique au démarrage du serveur", slog.Any("error", err))
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	slog.Info("Arrêt progressif du serveur (Graceful Shutdown)...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		slog.Error("Erreur lors de la fermeture du serveur", slog.Any("error", err))
	} else {
		slog.Info("Serveur arrêté proprement.")
	}
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func handleSearch(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	remoteAddr := r.RemoteAddr

	slog.Info("Requête entrante",
		slog.String("method", r.Method),
		slog.String("path", r.URL.Path),
		slog.String("raw_query", r.URL.RawQuery),
		slog.String("client_ip", remoteAddr),
	)

	if r.Method != http.MethodGet {
		slog.Warn("Méthode HTTP refusée", slog.String("method", r.Method))
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	queryParams := r.URL.Query()
	baseQuery := strings.TrimSpace(queryParams.Get("q"))
	if baseQuery == "" {
		slog.Warn("Paramètre 'q' absent de la requête")
		http.Error(w, "Le paramètre 'q' est requis", http.StatusBadRequest)
		return
	}

	if !cb.Allow() {
		slog.Warn("Requête rejetée : Circuit Breaker OUVERT")
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Retry-After", "60")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Service temporairement indisponible (Circuit Breaker actif)",
		})
		return
	}

	cacheKey := generateCacheKey(r)
	if item, found := searchCache.Get(cacheKey); found && time.Now().Before(item.expiredAt) {
		slog.Info("Cache HIT local",
			slog.String("cache_key", cacheKey),
			slog.Duration("latency", time.Since(start)),
		)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT-LOCAL")
		w.Write(item.data)
		return
	}

	slog.Info("Cache MISS local, demande d'exécution", slog.String("cache_key", cacheKey))

	v, err, shared := requestGroup.Do(cacheKey, func() (interface{}, error) {
		return executeSearch(r, cacheKey)
	})

	if err != nil {
		var invalidErr *InvalidQueryError
		if errors.As(err, &invalidErr) {
			slog.Warn("Recherche invalide/rejetée par GitHub (400)",
				slog.String("reason", invalidErr.Error()),
				slog.Duration("latency", time.Since(start)),
			)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{
				"error": invalidErr.Error(),
			})
			return
		}

		if strings.Contains(err.Error(), "RATE_LIMIT") {
			slog.Error("Rate limit GitHub atteint (503)", slog.Duration("latency", time.Since(start)))
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Retry-After", "60")
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "Limite d'appels API GitHub atteinte.",
			})
			return
		}

		slog.Error("Erreur lors de l'exécution de la recherche (502)",
			slog.Any("error", err),
			slog.Duration("latency", time.Since(start)),
		)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("Erreur amont : %v", err),
		})
		return
	}

	responseData := v.([]byte)
	cacheStatus := "MISS"
	if shared {
		cacheStatus = "HIT-SINGLEFLIGHT"
	}

	slog.Info("Requête traitée avec succès",
		slog.String("cache_status", cacheStatus),
		slog.Duration("latency", time.Since(start)),
		slog.Int("response_bytes", len(responseData)),
	)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Cache", cacheStatus)
	w.Write(responseData)
}

func executeSearch(r *http.Request, cacheKey string) ([]byte, error) {
	queryParams := r.URL.Query()
	baseQuery := strings.TrimSpace(queryParams.Get("q"))

	var qParts []string
	qParts = append(qParts, baseQuery, "has:pages")

	if rawLang := strings.TrimSpace(queryParams.Get("language")); rawLang != "" {
		var op string
		var langs []string

		if strings.Contains(rawLang, "+") {
			op = " AND "
			langs = strings.Split(rawLang, "+")
		} else {
			op = " OR "
			langs = strings.Split(rawLang, ",")
		}

		var langFilters []string
		for _, lang := range langs {
			if l := strings.TrimSpace(lang); l != "" {
				langFilters = append(langFilters, fmt.Sprintf("language:%s", l))
			}
		}

		if len(langFilters) == 1 {
			qParts = append(qParts, langFilters[0])
		} else if len(langFilters) > 1 {
			qParts = append(qParts, fmt.Sprintf("(%s)", strings.Join(langFilters, op)))
		}
	}

	if starsFilter := parseStarsParam(queryParams.Get("stars")); starsFilter != "" {
		qParts = append(qParts, starsFilter)
	}

	if pushed := strings.TrimSpace(queryParams.Get("pushed")); pushed != "" {
		qParts = append(qParts, fmt.Sprintf("pushed:%s", pushed))
	}

	if topic := strings.TrimSpace(queryParams.Get("topic")); topic != "" {
		qParts = append(qParts, fmt.Sprintf("topic:%s", topic))
	}

	if user := strings.TrimSpace(queryParams.Get("user")); user != "" {
		qParts = append(qParts, fmt.Sprintf("user:%s", user))
	}

	if org := strings.TrimSpace(queryParams.Get("org")); org != "" {
		qParts = append(qParts, fmt.Sprintf("org:%s", org))
	}

	if license := strings.TrimSpace(queryParams.Get("license")); license != "" {
		qParts = append(qParts, fmt.Sprintf("license:%s", license))
	}

	if fork := strings.TrimSpace(queryParams.Get("fork")); fork != "" {
		qParts = append(qParts, fmt.Sprintf("fork:%s", fork))
	}

	if archived := strings.TrimSpace(queryParams.Get("archived")); archived != "" {
		qParts = append(qParts, fmt.Sprintf("archived:%s", archived))
	}

	if size := strings.TrimSpace(queryParams.Get("size")); size != "" {
		qParts = append(qParts, fmt.Sprintf("size:%s", size))
	}

	if followers := strings.TrimSpace(queryParams.Get("followers")); followers != "" {
		qParts = append(qParts, fmt.Sprintf("followers:%s", followers))
	}

	fullQuery := strings.Join(qParts, " ")

	page, _ := strconv.Atoi(queryParams.Get("page"))
	if page < 1 {
		page = 1
	}

	perPage, _ := strconv.Atoi(queryParams.Get("per_page"))
	if perPage < 1 || perPage > 100 {
		perPage = 30
	}

	ghURL, _ := url.Parse("https://api.github.com/search/repositories")
	ghParams := ghURL.Query()
	ghParams.Set("q", fullQuery)
	ghParams.Set("page", strconv.Itoa(page))
	ghParams.Set("per_page", strconv.Itoa(perPage))

	if sortParam := strings.TrimSpace(queryParams.Get("sort")); sortParam != "" {
		ghParams.Set("sort", sortParam)
		if order := strings.TrimSpace(queryParams.Get("order")); order != "" {
			ghParams.Set("order", order)
		}
	}

	ghURL.RawQuery = ghParams.Encode()

	slog.Info("Préparation de l'appel API GitHub",
		slog.String("full_query", fullQuery),
		slog.Int("page", page),
		slog.Int("per_page", perPage),
		slog.String("target_url", ghURL.String()),
	)

	req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, ghURL.String(), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("User-Agent", "GitHub-Pages-App-Checker")

	if token := os.Getenv("GITHUB_TOKEN"); token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	}

	cachedItem, hasCache := searchCache.Get(cacheKey)
	if hasCache && cachedItem.etag != "" {
		req.Header.Set("If-None-Match", cachedItem.etag)
		slog.Debug("Envoi de l'ETag à GitHub", slog.String("etag", cachedItem.etag))
	}

	ghStart := time.Now()
	resp, err := httpClient.Do(req)
	ghDuration := time.Since(ghStart)

	if err != nil {
		cb.RecordFailure()
		slog.Error("Échec de connexion vers l'API GitHub",
			slog.Any("error", err),
			slog.Duration("duration", ghDuration),
		)
		return nil, fmt.Errorf("Erreur de connexion à GitHub: %w", err)
	}
	defer resp.Body.Close()

	slog.Info("Réponse reçue de GitHub API",
		slog.Int("status_code", resp.StatusCode),
		slog.Duration("duration", ghDuration),
	)

	if resp.StatusCode == http.StatusNotModified && hasCache {
		slog.Info("GitHub 304 Not Modified : revalidation du cache local réussi", slog.String("cache_key", cacheKey))
		cb.RecordSuccess()
		searchCache.Set(cacheKey, cachedItem.data, cachedItem.etag, 15*time.Minute)
		return cachedItem.data, nil
	}

	if resp.StatusCode == http.StatusUnprocessableEntity {
		var ghErr GitHubErrorResponse
		limitedReader := io.LimitReader(resp.Body, 10*1024*1024)
		if err := json.NewDecoder(limitedReader).Decode(&ghErr); err == nil && len(ghErr.Errors) > 0 {
			errMsg := fmt.Sprintf("Requête GitHub invalide : %s", ghErr.Errors[0].Message)
			slog.Warn("GitHub a rejeté la requête (422)", slog.String("github_error", ghErr.Errors[0].Message))
			return nil, &InvalidQueryError{Message: errMsg}
		}
		slog.Warn("GitHub a rejeté la requête (422) avec un corps non standard")
		return nil, &InvalidQueryError{Message: "Requête de recherche GitHub malformée."}
	}

	if resp.StatusCode == http.StatusForbidden || resp.StatusCode == http.StatusTooManyRequests {
		cb.RecordFailure()
		slog.Error("Limite d'API GitHub dépassée ou requêtes bloquées", slog.Int("status_code", resp.StatusCode))
		return nil, fmt.Errorf("RATE_LIMIT")
	}

	if resp.StatusCode != http.StatusOK {
		cb.RecordFailure()
		slog.Error("Erreur inattendue de l'API GitHub", slog.Int("status_code", resp.StatusCode))
		return nil, fmt.Errorf("Erreur API GitHub (HTTP %d)", resp.StatusCode)
	}

	cb.RecordSuccess()

	limitedReader := io.LimitReader(resp.Body, 1*1024*1024)
	var ghResp GitHubSearchResponse
	if err := json.NewDecoder(limitedReader).Decode(&ghResp); err != nil {
		slog.Error("Échec de découpage/décodage JSON de GitHub", slog.Any("error", err))
		return nil, err
	}

	slog.Info("Résultats bruts reçus de GitHub",
		slog.Int("total_count", ghResp.TotalCount),
		slog.Int("items_in_page", len(ghResp.Items)),
	)

	urlsToTest := make([]string, len(ghResp.Items))
	for i, item := range ghResp.Items {
		urlsToTest[i] = fmt.Sprintf("https://%s.github.io/%s/", item.Owner.Login, item.Name)
	}

	validURLs := filterLiveURLs(r.Context(), urlsToTest)

	totalCount := ghResp.TotalCount
	if totalCount > 1000 {
		totalCount = 1000
	}

	totalPages := (totalCount + perPage - 1) / perPage
	if totalPages == 0 {
		totalPages = 1
	}

	var nextPage, prevPage *int
	if page < totalPages {
		n := page + 1
		nextPage = &n
	}
	if page > 1 {
		p := page - 1
		prevPage = &p
	}

	responsePayload := APIResponse{
		TotalResults: ghResp.TotalCount,
		TotalPages:   totalPages,
		CurrentPage:  page,
		PerPage:      perPage,
		NextPage:     nextPage,
		PrevPage:     prevPage,
		PagesURLs:    validURLs,
	}

	responseData, err := json.Marshal(responsePayload)
	if err != nil {
		slog.Error("Échec de la sérialisation de la réponse JSON finale", slog.Any("error", err))
		return nil, err
	}

	newETag := resp.Header.Get("ETag")
	searchCache.Set(cacheKey, responseData, newETag, 15*time.Minute)
	slog.Debug("Réponse enregistrée dans le cache local",
		slog.String("cache_key", cacheKey),
		slog.String("etag", newETag),
	)

	return responseData, nil
}

func filterLiveURLs(ctx context.Context, urls []string) []string {
	start := time.Now()
	var wg sync.WaitGroup
	results := make(chan string, len(urls))

	slog.Info("Début de la vérification des URLs Pages", slog.Int("total_urls", len(urls)))

	for _, u := range urls {
		wg.Add(1)
		go func(targetURL string) {
			defer wg.Done()

			if isLive, found := urlCache.Get(targetURL); found {
				slog.Debug("Cache HIT URL status", slog.String("url", targetURL), slog.Bool("is_live", isLive))
				if isLive {
					results <- targetURL
				}
				return
			}

			select {
			case <-ctx.Done():
				slog.Warn("Vérification URL interrompue par l'annulation du client", slog.String("url", targetURL))
				return
			case globalConcurrencySem <- struct{}{}:
				defer func() { <-globalConcurrencySem }()
			}

			isLive := isHTTP200(ctx, targetURL)
			urlCache.Set(targetURL, isLive, 5*time.Minute)

			if isLive {
				results <- targetURL
			}
		}(u)
	}

	wg.Wait()
	close(results)

	var valid []string
	for u := range results {
		valid = append(valid, u)
	}

	slog.Info("Vérification des URLs terminée",
		slog.Int("valid_urls_found", len(valid)),
		slog.Int("tested_urls", len(urls)),
		slog.Duration("duration", time.Since(start)),
	)

	return valid
}

func isHTTP200(parentCtx context.Context, targetURL string) bool {
	ctx, cancel := context.WithTimeout(parentCtx, 1500*time.Millisecond)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, targetURL, nil)
	if err != nil {
		slog.Debug("Échec de création de la requête URL", slog.String("url", targetURL), slog.Any("error", err))
		return false
	}

	req.Header.Set("Range", "bytes=0-0")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

	resp, err := httpClient.Do(req)
	if err != nil {
		slog.Debug("URL inatteignable ou hors délai (timeout)", slog.String("url", targetURL), slog.Any("error", err))
		return false
	}
	defer resp.Body.Close()

	io.CopyN(io.Discard, resp.Body, 1024)

	isLive := resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusPartialContent
	slog.Debug("Résultat du test URL",
		slog.String("url", targetURL),
		slog.Int("status_code", resp.StatusCode),
		slog.Bool("is_live", isLive),
	)

	return isLive
}

func generateCacheKey(r *http.Request) string {
	queryParams := r.URL.Query()

	keys := make([]string, 0, len(queryParams))
	for k := range queryParams {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var builder strings.Builder
	for _, k := range keys {
		values := queryParams[k]
		sort.Strings(values)
		for _, v := range values {
			if trimmed := strings.TrimSpace(v); trimmed != "" {
				builder.WriteString(fmt.Sprintf("%s=%s&", k, trimmed))
			}
		}
	}

	hash := sha256.Sum256([]byte(builder.String()))
	return hex.EncodeToString(hash[:])
}

func parseStarsParam(rawValue string) string {
	rawValue = strings.TrimSpace(rawValue)
	if rawValue == "" {
		return ""
	}

	parts := strings.Split(rawValue, ",")
	var clauses []string

	for _, part := range parts {
		if p := strings.TrimSpace(part); p != "" {
			clauses = append(clauses, fmt.Sprintf("stars:%s", p))
		}
	}

	if len(clauses) == 1 {
		return clauses[0]
	} else if len(clauses) > 1 {
		return fmt.Sprintf("(%s)", strings.Join(clauses, " OR "))
	}

	return ""
}

func createOptimizedClient() *http.Client {
	dialer := &net.Dialer{
		Timeout:   1 * time.Second,
		KeepAlive: 30 * time.Second,
	}

	transport := &http.Transport{
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			return dialer.DialContext(ctx, "tcp4", addr)
		},
		MaxIdleConns:        200,
		MaxIdleConnsPerHost: 50,
		IdleConnTimeout:     90 * time.Second,
	}

	return &http.Client{
		Transport: transport,
	}
}