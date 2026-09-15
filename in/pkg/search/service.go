package search

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github-search-api/pkg/cache"
	"github-search-api/pkg/circuitbreaker"
	"github-search-api/pkg/models"
)

type Service struct {
	httpClient           *http.Client
	searchCache          *cache.MemoryCache
	urlCache             *cache.URLStatusCache
	globalConcurrencySem chan struct{}
	cb                   *circuitbreaker.CircuitBreaker
}

func NewService(
	searchCache *cache.MemoryCache,
	urlCache *cache.URLStatusCache,
	cb *circuitbreaker.CircuitBreaker,
) *Service {
	return &Service{
		httpClient:           createOptimizedClient(),
		searchCache:          searchCache,
		urlCache:             urlCache,
		globalConcurrencySem: make(chan struct{}, 50),
		cb:                   cb,
	}
}

func (s *Service) ExecuteSearch(r *http.Request, cacheKey string) ([]byte, error) {
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

	cachedItem, hasCache := s.searchCache.Get(cacheKey)
	if hasCache && cachedItem.Etag != "" {
		req.Header.Set("If-None-Match", cachedItem.Etag)
		slog.Debug("Envoi de l'ETag à GitHub", slog.String("etag", cachedItem.Etag))
	}

	ghStart := time.Now()
	resp, err := s.httpClient.Do(req)
	ghDuration := time.Since(ghStart)

	if err != nil {
		s.cb.RecordFailure()
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
		s.cb.RecordSuccess()
		s.searchCache.Set(cacheKey, cachedItem.Data, cachedItem.Etag, 15*time.Minute)
		return cachedItem.Data, nil
	}

	if resp.StatusCode == http.StatusUnprocessableEntity {
		var ghErr models.GitHubErrorResponse
		limitedReader := io.LimitReader(resp.Body, 10*1024*1024)
		if err := json.NewDecoder(limitedReader).Decode(&ghErr); err == nil && len(ghErr.Errors) > 0 {
			errMsg := fmt.Sprintf("Requête GitHub invalide : %s", ghErr.Errors[0].Message)
			slog.Warn("GitHub a rejeté la requête (422)", slog.String("github_error", ghErr.Errors[0].Message))
			return nil, &models.InvalidQueryError{Message: errMsg}
		}
		slog.Warn("GitHub a rejeté la requête (422) avec un corps non standard")
		return nil, &models.InvalidQueryError{Message: "Requête de recherche GitHub malformée."}
	}

	if resp.StatusCode == http.StatusForbidden || resp.StatusCode == http.StatusTooManyRequests {
		s.cb.RecordFailure()
		slog.Error("Limite d'API GitHub dépassée ou requêtes bloquées", slog.Int("status_code", resp.StatusCode))
		return nil, fmt.Errorf("RATE_LIMIT")
	}

	if resp.StatusCode != http.StatusOK {
		s.cb.RecordFailure()
		slog.Error("Erreur inattendue de l'API GitHub", slog.Int("status_code", resp.StatusCode))
		return nil, fmt.Errorf("Erreur API GitHub (HTTP %d)", resp.StatusCode)
	}

	s.cb.RecordSuccess()

	limitedReader := io.LimitReader(resp.Body, 10*1024*1024)
	var ghResp models.GitHubSearchResponse
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

	validURLs := s.filterLiveURLs(r.Context(), urlsToTest)

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

	responsePayload := models.APIResponse{
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
	s.searchCache.Set(cacheKey, responseData, newETag, 15*time.Minute)
	slog.Debug("Réponse enregistrée dans le cache local",
		slog.String("cache_key", cacheKey),
		slog.String("etag", newETag),
	)

	return responseData, nil
}

func (s *Service) filterLiveURLs(ctx context.Context, urls []string) []string {
	start := time.Now()
	var wg sync.WaitGroup
	results := make(chan string, len(urls))

	slog.Info("Début de la vérification des URLs Pages", slog.Int("total_urls", len(urls)))

	for _, u := range urls {
		wg.Add(1)
		go func(targetURL string) {
			defer wg.Done()

			if isLive, found := s.urlCache.Get(targetURL); found {
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
			case s.globalConcurrencySem <- struct{}{}:
				defer func() { <-s.globalConcurrencySem }()
			}

			isLive := s.isHTTP200(ctx, targetURL)
			s.urlCache.Set(targetURL, isLive, 5*time.Minute)

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

func (s *Service) isHTTP200(parentCtx context.Context, targetURL string) bool {
	ctx, cancel := context.WithTimeout(parentCtx, 1500*time.Millisecond)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, targetURL, nil)
	if err != nil {
		slog.Debug("Échec de création de la requête URL", slog.String("url", targetURL), slog.Any("error", err))
		return false
	}

	req.Header.Set("Range", "bytes=0-0")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

	resp, err := s.httpClient.Do(req)
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
