package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// Requêtes reçues par ton API Go
	HTTPRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Nombre total de requêtes HTTP reçues.",
		},
		[]string{"path", "status"},
	)

	HTTPRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Durée de traitement des requêtes HTTP en secondes.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"path"},
	)

	// Appels vers l'API GitHub
	GitHubAPIDuration = promauto.NewHistogram(
		prometheus.HistogramOpts{
			Name:    "github_api_duration_seconds",
			Help:    "Durée des requêtes sortantes vers l'API GitHub.",
			Buckets: []float64{0.1, 0.25, 0.5, 1.0, 2.5, 5.0},
		},
	)

	GitHubAPIResponsesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "github_api_responses_total",
			Help: "Codes de réponse retournés par l'API GitHub.",
		},
		[]string{"status_code"},
	)

	// Performance du Cache
	CacheHitsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "cache_requests_total",
			Help: "Résultats d'accès au cache (hits / misses).",
		},
		[]string{"cache_name", "status"}, // status: "hit" ou "miss"
	)

	// Vérification des URLs github.io
	URLCheckResultsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "url_check_results_total",
			Help: "Nombre d'URLs testées par statut (live/dead).",
		},
		[]string{"result"}, // "live" ou "dead"
	)
)
