# Étape 1 : Compilation du binaire Go
FROM golang:alpine AS builder

WORKDIR /app

# Copie et téléchargement des dépendances
COPY go.mod ./
# COPY go.sum ./  # Décommente si tu as un fichier go.sum
RUN go mod download

# Copie du code source et compilation d'un binaire Linux statique
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o github-search-api .

# Étape 2 : Image finale d'exécution minimale
FROM alpine:3.19

# Ajout des certificats CA indispensables pour les requêtes HTTPS vers l'API GitHub
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copie du binaire compilé
COPY --from=builder /app/github-search-api .

# Port exposé par défaut
EXPOSE 8080

ENV PORT=8080

# Exécution du service
CMD ["./github-search-api"]