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

	searchCache := cache.NewMemoryCache(10 * time.Minute)
	urlCache := cache.NewURLStatusCache(5 * time.Minute)
	cb := circuitbreaker.New(5, 1*time.Minute)

	searchService := search.NewService(searchCache, urlCache, cb)
	handler := api.NewHandler(searchService, searchCache, cb)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: api.CorsMiddleware(handler.HandleSearch),
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
