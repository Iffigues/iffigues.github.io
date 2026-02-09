package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// Message définit la structure des données reçues
type Message struct {
	User    string  `json:"user"`
	Content string  `json:"content"`
	Email   *string `json:"email,omitempty"` // Pointeur pour gérer l'absence de valeur
}

const storageDir = "messages"

func main() {
	// 1. S'assurer que le dossier de stockage existe
	if _, err := os.Stat(storageDir); os.IsNotExist(err) {
		err := os.MkdirAll(storageDir, 0755)
		if err != nil {
			fmt.Printf("❌ Erreur création dossier: %v\n", err)
			return
		}
	}

	// 2. Configuration du nouveau Router Go 1.22
	mux := http.NewServeMux()

	// On définit les routes avec METHODE + PATH
	mux.HandleFunc("POST /message", handlePost)
	mux.HandleFunc("OPTIONS /message", handleOptions) // Requis pour les navigateurs (CORS)

	// 3. Gestion du port (pour l'hébergement cloud)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 Serveur démarré sur http://localhost:%s\n", port)
	fmt.Printf("📁 Les messages seront sauvegardés dans le dossier: %s/\n", storageDir)

	if err := http.ListenAndServe(":"+port, mux); err != nil {
		fmt.Printf("❌ Erreur serveur: %v\n", err)
	}
}

// handlePost traite l'envoi du message
func handlePost(w http.ResponseWriter, r *http.Request) {
	setupCORS(&w)

	var msg Message
	// Décodage du JSON
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, "Format JSON invalide", http.StatusBadRequest)
		return
	}

	// Vérification des champs obligatoires
	if msg.User == "" || msg.Content == "" {
		http.Error(w, "Champs 'user' et 'content' requis", http.StatusBadRequest)
		return
	}

	// Gestion de l'email optionnel pour l'affichage/sauvegarde
	emailDisplay := "Non fourni"
	if msg.Email != nil && *msg.Email != "" {
		emailDisplay = *msg.Email
	}

	// 4. Préparation du fichier
	timestamp := time.Now().Format("2006-01-02_15-04-05")
	filename := fmt.Sprintf("%s_%s.txt", timestamp, msg.User)
	path := filepath.Join(storageDir, filename)

	content := fmt.Sprintf(
		"Date: %s\nUtilisateur: %s\nEmail: %s\nMessage:\n%s\n",
		time.Now().Format(time.RFC1123),
		msg.User,
		emailDisplay,
		msg.Content,
	)

	// Écriture sur le disque
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		fmt.Printf("❌ Erreur sauvegarde: %v\n", err)
		http.Error(w, "Erreur lors de la sauvegarde", http.StatusInternalServerError)
		return
	}

	fmt.Printf("📩 Nouveau message de %s (%s)\n", msg.User, emailDisplay)

	// Réponse JSON au client
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Message bien reçu et sauvegardé",
	})
}

// handleOptions gère le "Preflight" des navigateurs
func handleOptions(w http.ResponseWriter, r *http.Request) {
	setupCORS(&w)
	w.WriteHeader(http.StatusOK)
}

// setupCORS configure les headers pour ton site sur GitHub Pages
func setupCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "https://iffigues.github.io")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}