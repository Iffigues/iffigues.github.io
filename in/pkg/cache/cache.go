package cache

import (
	"crypto/sha256"
	"encoding/hex"
	"log/slog"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"
)

type CacheItem struct {
	Data      []byte
	Etag      string
	ExpiredAt time.Time
}

type MemoryCache struct {
	mu    sync.RWMutex
	items map[string]CacheItem
}

func NewMemoryCache(cleanupInterval time.Duration) *MemoryCache {
	c := &MemoryCache{
		items: make(map[string]CacheItem),
	}
	go c.startCleanup(cleanupInterval)
	return c
}

func (c *MemoryCache) Get(key string) (CacheItem, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[key]
	if !found {
		return CacheItem{}, false
	}
	return item, true
}

func (c *MemoryCache) Set(key string, data []byte, etag string, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = CacheItem{
		Data:      data,
		Etag:      etag,
		ExpiredAt: time.Now().Add(ttl),
	}
}

func (c *MemoryCache) startCleanup(interval time.Duration) {
	ticker := time.NewTicker(interval)
	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		deletedCount := 0
		for k, v := range c.items {
			if now.After(v.ExpiredAt) {
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

type URLCacheItem struct {
	IsLive    bool
	ExpiredAt time.Time
}

type URLStatusCache struct {
	mu    sync.RWMutex
	items map[string]URLCacheItem
}

func NewURLStatusCache(cleanupInterval time.Duration) *URLStatusCache {
	c := &URLStatusCache{
		items: make(map[string]URLCacheItem),
	}
	go c.startCleanup(cleanupInterval)
	return c
}

func (c *URLStatusCache) Get(url string) (bool, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[url]
	if !found || time.Now().After(item.ExpiredAt) {
		return false, false
	}
	return item.IsLive, true
}

func (c *URLStatusCache) Set(url string, isLive bool, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[url] = URLCacheItem{
		IsLive:    isLive,
		ExpiredAt: time.Now().Add(ttl),
	}
}

func (c *URLStatusCache) startCleanup(interval time.Duration) {
	ticker := time.NewTicker(interval)
	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		deletedCount := 0
		for k, v := range c.items {
			if now.After(v.ExpiredAt) {
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

func GenerateCacheKey(r *http.Request) string {
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
				builder.WriteString(k + "=" + trimmed + "&")
			}
		}
	}

	hash := sha256.Sum256([]byte(builder.String()))
	return hex.EncodeToString(hash[:])
}
