package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"golang.org/x/sync/singleflight"

	"github-search-api/pkg/cache"
	"github-search-api/pkg/circuitbreaker"
	"github-search-api/pkg/models"
	"github-search-api/pkg/search"
)

type Handler struct {
	searchService *search.Service
	searchCache   *cache.MemoryCache
	cb            *circuitbreaker.CircuitBreaker
	requestGroup  singleflight.Group
}

func NewHandler(
	searchService *search.Service,
	searchCache *cache.MemoryCache,
	cb *circuitbreaker.CircuitBreaker,
) *Handler {
	return &Handler{
		searchService: searchService,
		searchCache:   searchCache,
		cb:            cb,
	}
}

func CorsMiddleware(next http.HandlerFunc) http.HandlerFunc {
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

func (h *Handler) HandleSearch(w http.ResponseWriter, r *http.Request) {
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

	if !h.cb.Allow() {
		slog.Warn("Requête rejetée : Circuit Breaker OUVERT")
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Retry-After", "60")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Service temporairement indisponible (Circuit Breaker actif)",
		})
		return
	}

	cacheKey := cache.GenerateCacheKey(r)
	if item, found := h.searchCache.Get(cacheKey); found && time.Now().Before(item.ExpiredAt) {
		slog.Info("Cache HIT local",
			slog.String("cache_key", cacheKey),
			slog.Duration("latency", time.Since(start)),
		)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT-LOCAL")
		w.Write(item.Data)
		return
	}

	slog.Info("Cache MISS local, demande d'exécution", slog.String("cache_key", cacheKey))

	v, err, shared := h.requestGroup.Do(cacheKey, func() (interface{}, error) {
		return h.searchService.ExecuteSearch(r, cacheKey)
	})

	if err != nil {
		var invalidErr *models.InvalidQueryError
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
