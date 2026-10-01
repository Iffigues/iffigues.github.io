# Étape 1 : Compilation du binaire avec Go 1.25
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copie des fichiers de module et du code source
COPY go.mod go.sum* ./
COPY . .

# Résolution et téléchargement des dépendances
RUN go get github.com/prometheus/client_golang/prometheus/promhttp && go mod tidy

# Compilation du binaire statique ciblant le point d'entrée cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o /app/github-search-api ./cmd/server

# Étape 2 : Image d'exécution minimale et sécurisée (Distroless)
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /

# Copie du binaire compilé
COPY --from=builder /app/github-search-api /github-search-api

# Exposition du port HTTP
EXPOSE 8080

ENV PORT=8080

USER nonroot:nonroot

ENTRYPOINT ["/github-search-api"]