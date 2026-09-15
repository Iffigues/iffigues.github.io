package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github-search-api/pkg/api"
	"github-search-api/pkg/cache"
	"github-search-api/pkg/circuitbreaker"
	"github-search-api/pkg/search"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	// 1. Initialisation des services et handlers
	searchCache := cache.NewMemoryCache(10 * time.Minute)
	urlCache := cache.NewURLStatusCache(5 * time.Minute)
	cb := circuitbreaker.New(5, 1*time.Minute)

	searchService := search.NewService(searchCache, urlCache, cb)
	handler := api.NewHandler(searchService, searchCache, cb)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// -------------------------------------------------------------
	// ICI : Instanciation du Mux et enregistrement de la route
	// -------------------------------------------------------------
	mux := http.NewServeMux()

	// Route d'API protégée par le middleware CORS
	mux.HandleFunc("/api/search", api.CorsMiddleware(handler.HandleSearch))

	// Route de fallback (Catch-all) pour bloquer les scanners (404 Not Found)
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		slog.Warn("Tentative d'accès à une route inexistante (scannage rejeté)",
			slog.String("path", r.URL.Path),
			slog.String("client_ip", r.RemoteAddr),
		)
		http.NotFound(w, r)
	})

	// Passage du mux comme Handler du serveur HTTP
	server := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	// 2. Démarrage du serveur et Graceful Shutdown
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
