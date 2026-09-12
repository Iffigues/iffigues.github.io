---
layout: post
title: "Création d'un moteur de recherche dédié aux sites GitHub Pages"
date: 2026-09-12 10:00:00 +0200
categories: [Projets, Go, JavaScript]
tags: [golang, github-api, jekyll, frontend]
---

Avoir un site hébergé sur **GitHub Pages**, c'est génial : c'est gratuit, rapide et parfaitement intégré avec Git. Cependant, trouver des projets ou des portfolios réels hébergés sous le domaine `.github.io` via l'interface standard de GitHub peut parfois s'avérer complexe.

Pour résoudre ce problème, j'ai développé un **moteur de recherche dédié aux GitHub Pages**, combinant un backend performant en **Go** et un frontend dynamique sous **Jekyll**.

---

## 🛠️ Architecture du projet

Le projet se divise en deux parties principales :

1. **Backend (API en Go)** : Reçoit les requêtes de recherche, interroge l'API GitHub Search Repositories avec le filtre `has:pages`, puis **vérifie en direct l'accessibilité HTTP** (codes 200 OK via requêtes HEAD/GET) des URLs `https://<user>.github.io/<repo>/`.
2. **Frontend (Jekyll / JavaScript native)** : Une interface épurée assurant le contrôle des critères de recherche, la gestion des balises/tags dynamiques et la pagination des résultats.

---

## 🚀 Fonctionnalités et Filtres Avancés

Le moteur ne se contente pas d'une recherche par mot-clé basique. Il permet d'affiner précisément la découverte des projets grâce à **11 filtres ciblés** :

* **Recherche textuelle & Empreintes techniques** : Combinaison de termes libres et d'empreintes spécifiques (`filename:package.json`, `path:docs`, etc.) avec opérateurs booléens (`ET`, `OU`, `EXCLURE`).
* **Filtrage par Langage** : Prise en charge multi-langages (ex: `go`, `python`, `typescript`) combinables en mode `AND` (`+`) ou `OR` (`,`).
* **Sujets & Propriétaires** : Filtrage direct par `topic`, nom d'utilisateur (`user`) ou organisation (`org`).
* **Critères du Dépôt** :
  * Sélection du type de **Licence** (MIT, Apache 2.0, GPL v3...).
  * Gestion des **Forks** (les inclure, les exclure ou cibler uniquement les forks).
  * Inclusion ou exclusion des dépôts **archivés**.
  * Filtrage par **Taille du dépôt** (en Ko) et **Followers** de l'auteur.
* **Étoiles & Dates de MàJ** : Sélection par minimum ou intervalle d'étoiles (`stars`), ainsi que par date du dernier `push` (date précise, intervalle ou raccourcis temporels comme les 30 derniers jours).

---

## ⚙️ Les défis techniques relevés

### 1. Force du protocole IPv4 dans le backend Go
Lors de l'interrogation d'APIs externes et de la vérification de l'existence des sites web, la résolution IPv6 peut parfois ralentir les requêtes selon les réseaux d'hébergement. Le client HTTP backend a donc été configuré pour forcer les résolutions en **IPv4 / `tcp4`**, garantissant un temps de réponse rapide lors des contrôles de disponibilité.

```go
func createIPv4Client(timeout time.Duration) *http.Client {
	dialer := &net.Dialer{
		Timeout:   timeout,
		KeepAlive: 30 * time.Second,
	}

	transport := &http.Transport{
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			return dialer.DialContext(ctx, "tcp4", addr) // Force IPv4
		},
	}

	return &http.Client{
		Timeout:   timeout,
		Transport: transport,
	}
}