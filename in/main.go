package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
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
	Name    string `json:"name"`
	Owner   Owner  `json:"owner"`
	HasPages bool  `json:"has_pages"`
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
	http.HandleFunc("/api/search", corsMiddleware(handleSearch))

	log.Println("Serveur démarré sur http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Erreur serveur : %v", err)
	}
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func handleSearch(w http.ResponseWriter, r *http.Request) {
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

	// 1. Construction du paramètre "q" pour GitHub
	var qParts []string
	qParts = append(qParts, baseQuery)

	// Filtre obligatoire : uniquement les dépôts avec GitHub Pages
	qParts = append(qParts, "has:pages")

	// Injection des filtres optionnels
	if lang := strings.TrimSpace(queryParams.Get("language")); lang != "" {
		qParts = append(qParts, fmt.Sprintf("language:%s", lang))
	}
	if stars := strings.TrimSpace(queryParams.Get("stars")); stars != "" {
		qParts = append(qParts, fmt.Sprintf("stars:%s", stars))
	}
	if pushed := strings.TrimSpace(queryParams.Get("pushed")); pushed != "" {
		qParts = append(qParts, fmt.Sprintf("pushed:%s", pushed))
	}

	fullQuery := strings.Join(qParts, " ")

	// 2. Traitement de la pagination et du tri
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

	// 3. Appel à l'API GitHub
	req, err := http.NewRequest(http.MethodGet, ghURL.String(), nil)
	if err != nil {
		http.Error(w, "Erreur lors de la création de la requête", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("User-Agent", "GitHub-Pages-Checker")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf("Erreur API GitHub (HTTP %d)", resp.StatusCode), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	var ghResp GitHubSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&ghResp); err != nil {
		http.Error(w, "Erreur de lecture de la réponse GitHub", http.StatusInternalServerError)
		return
	}

	// 4. Test de résolutions HTTP concurrentes sur les URL de pages
	urlsToTest := make([]string, len(ghResp.Items))
	for i, item := range ghResp.Items {
		urlsToTest[i] = fmt.Sprintf("https://%s.github.io/%s/", item.Owner.Login, item.Name)
	}

	validURLs := filterLiveURLs(urlsToTest)

	// 5. Calcul de la pagination
	totalCount := ghResp.TotalCount
	if totalCount > 1000 {
		totalCount = 1000 // Limite absolue de l'API Search GitHub
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

func filterLiveURLs(urls []string) []string {
	var wg sync.WaitGroup
	validChan := make(chan string, len(urls))
	client := &http.Client{Timeout: 3 * time.Second}

	for _, targetURL := range urls {
		wg.Add(1)
		go func(u string) {
			defer wg.Done()
			req, err := http.NewRequest(http.MethodHead, u, nil)
			if err != nil {
				return
			}
			req.Header.Set("User-Agent", "GitHub-Pages-Checker")

			resp, err := client.Do(req)
			if err == nil {
				defer resp.Body.Close()
				if resp.StatusCode == http.StatusOK {
					validChan <- u
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