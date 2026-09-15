# Étape 1 : Compilation du binaire
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Invalidation de cache optimale pour les dépendances
COPY go.mod go.sum* ./
RUN go mod download

# Copie de l'ensemble du code source
COPY . .

# Compilation du binaire statique ciblant le point d'entrée cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o /app/github-search-api ./cmd/server

# Étape 2 : Image d'exécution minimale et sécurisée (Distroless)
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /

# Copie du binaire compilé depuis l'étape précédente
COPY --from=builder /app/github-search-api /github-search-api

# Exposition du port HTTP
EXPOSE 8080

ENV PORT=8080

# Utilisation de l'utilisateur non-root par défaut
USER nonroot:nonroot

ENTRYPOINT ["/github-search-api"]