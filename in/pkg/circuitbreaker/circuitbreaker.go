package circuitbreaker

import (
	"log/slog"
	"sync"
	"time"
)

type CircuitBreaker struct {
	mu           sync.Mutex
	failures     int
	threshold    int
	openUntil    time.Time
	cooldownTime time.Duration
}

func New(threshold int, cooldown time.Duration) *CircuitBreaker {
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
