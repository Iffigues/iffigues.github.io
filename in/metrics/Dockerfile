# Stage 1: Build
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY go.mod go.sum ./
RUN go mod download

# Copie du code source
COPY . .

# Compilation du binaire statique
RUN CGO_ENABLED=0 GOOS=linux go build -o /api main.go

# Stage 2: Image finale minimale
FROM alpine:3.19

RUN apk --no-cache add ca-certificates

WORKDIR /root/
COPY --from=builder /api .

EXPOSE 8080

CMD ["./api"]