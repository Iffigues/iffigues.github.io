package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

type GitHubSearchResponse struct {
	TotalCount int          `json:"total_count"`
	Items      []GitHubRepo `json:"items"`
}

type GitHubRepo struct {
	Name     string `json:"name"`
	Owner    Owner  `json:"owner"`
	HasPages bool   `json:"has_pages"`
}

type Owner struct {
	Login string `json:"login"`
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

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/api/search", corsMiddleware(handleSearch))

	log.Printf("Serveur démarré sur le port :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Erreur serveur : %v", err)
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
	log.Printf("--> [%s] %s %s (depuis %s)", r.Method, r.URL.Path, r.URL.RawQuery, r.RemoteAddr)

	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	queryParams := r.URL.Query()
	baseQuery := strings.TrimSpace(queryParams.Get("q"))
	if baseQuery == "" {
		http.Error(w, "Le paramètre 'q' est requis", http.StatusBadRequest)
		return
	}

	// 1. Construction de la requête pour GitHub
	var qParts []string
	qParts = append(qParts, baseQuery)
	qParts = append(qParts, "has:pages")

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
			lang = strings.TrimSpace(lang)
			if lang != "" {
				langFilters = append(langFilters, fmt.Sprintf("language:%s", lang))
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

	fullQuery := strings.Join(qParts, " ")

	// 2. Pagination et Tri
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

	if sort := strings.TrimSpace(queryParams.Get("sort")); sort != "" {
		ghParams.Set("sort", sort)
		if order := strings.TrimSpace(queryParams.Get("order")); order != "" {
			ghParams.Set("order", order)
		}
	}

	ghURL.RawQuery = ghParams.Encode()

	log.Printf("    ↳ Requête construite q: %s", fullQuery)
	log.Printf("    ↳ URL finale GitHub:    %s", ghURL.String())

	// 3. Appel à l'API GitHub avec client forcé en IPv4 (tcp4)
	req, err := http.NewRequest(http.MethodGet, ghURL.String(), nil)
	if err != nil {
		http.Error(w, "Erreur lors de la création de la requête", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("User-Agent", "GitHub-Pages-App-Checker")

	if token := os.Getenv("GITHUB_TOKEN"); token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	}

	client := createIPv4Client(10 * time.Second)
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Erreur réseau lors de l'appel GitHub: %v", err)
		http.Error(w, "Erreur de connexion à GitHub", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("GitHub a répondu avec le code HTTP %d", resp.StatusCode)
		http.Error(w, fmt.Sprintf("Erreur API GitHub (HTTP %d)", resp.StatusCode), http.StatusBadGateway)
		return
	}

	var ghResp GitHubSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&ghResp); err != nil {
		http.Error(w, "Erreur de lecture de la réponse GitHub", http.StatusInternalServerError)
		return
	}

	// 4. Test des URLs GitHub Pages
	urlsToTest := make([]string, len(ghResp.Items))
	for i, item := range ghResp.Items {
		urlsToTest[i] = fmt.Sprintf("https://%s.github.io/%s/", item.Owner.Login, item.Name)
	}

	validURLs := filterLiveURLs(urlsToTest)

	// 5. Réponse
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responsePayload)
}

func parseStarsParam(rawValue string) string {
	rawValue = strings.TrimSpace(rawValue)
	if rawValue == "" {
		return ""
	}

	parts := strings.Split(rawValue, ",")
	var clauses []string

	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			clauses = append(clauses, fmt.Sprintf("stars:%s", part))
		}
	}

	if len(clauses) == 1 {
		return clauses[0]
	} else if len(clauses) > 1 {
		return fmt.Sprintf("(%s)", strings.Join(clauses, " OR "))
	}

	return ""
}

func filterLiveURLs(urls []string) []string {
	var wg sync.WaitGroup
	validChan := make(chan string, len(urls))
	client := createIPv4Client(4 * time.Second)

	for _, targetURL := range urls {
		wg.Add(1)
		go func(u string) {
			defer wg.Done()

			// Essai en HEAD
			req, err := http.NewRequest(http.MethodHead, u, nil)
			if err == nil {
				req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
				resp, err := client.Do(req)
				if err == nil {
					resp.Body.Close()
					if resp.StatusCode == http.StatusOK {
						validChan <- u
						return
					}
				}
			}

			// Fallback en GET si HEAD échoue
			reqGet, err := http.NewRequest(http.MethodGet, u, nil)
			if err == nil {
				reqGet.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
				respGet, err := client.Do(reqGet)
				if err == nil {
					respGet.Body.Close()
					if respGet.StatusCode == http.StatusOK {
						validChan <- u
					}
				}
			}
		}(targetURL)
	}

	wg.Wait()
	close(validChan)

	var valid []string
	for u := range validChan {
		valid = append(valid, u)
	}
	return valid
}

// Client HTTP configuré en tcp4 (IPv4 uniquement) pour éviter les blocages Fly.io
func createIPv4Client(timeout time.Duration) *http.Client {
	dialer := &net.Dialer{
		Timeout:   timeout,
		KeepAlive: 30 * time.Second,
	}

	transport := &http.Transport{
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			return dialer.DialContext(ctx, "tcp4", addr)
		},
	}

	return &http.Client{
		Timeout:   timeout,
		Transport: transport,
	}
}