---
layout: default
title: Moteur de recherche GitHub Pages
description: "Outil en ligne pour rechercher et explorer les sites web, blogs et documentations hébergés sur GitHub Pages."

custom_css:
  - /assets/css/github-search.css
custom_js:
  - /assets/js/github-search.js

custom_meta:
  - name: "keywords"
    content: "github pages, recherche, moteur de recherche, jekyll, sites statiques, github.io"
  - name: "robots"
    content: "index, follow"
  - name: "author"
    content: "Boris Denoyelle"

custom_og:
  - property: "og:type"
    content: "website"
  - property: "og:title"
    content: "Moteur de recherche pour sites GitHub Pages"
  - property: "og:description"
    content: "Trouvez et explorez facilement les sites et blogs hébergés sur GitHub Pages."
  - property: "og:image"
    content: "/assets/img/og-github-search.png"
  - name: "twitter:card"
    content: "summary_large_image"
---

<div class="search-container">
    <form id="search-form">
        <!-- BARRE DE RECHERCHE PRINCIPALE -->
        <div class="search-box">
            <input type="text" id="query-input" placeholder="Mots-clés (ex: portfolio, blog, docs...)" />
            <button type="submit" id="search-btn" class="btn-primary">Chercher</button>
        </div>

        <button type="button" id="toggle-filters-btn" class="toggle-filters-btn" aria-expanded="false" aria-controls="collapsible-filters">
            <span class="toggle-icon">▶</span> Filtres avancés
        </button>

        <div id="collapsible-filters" class="collapsible-filters">
            <div class="filters-grid">

                <!-- TRI ET PAGINATION -->
                <div class="filter-group">
                    <label for="sort-select">Trier par</label>
                    <select id="sort-select">
                        <option value="" selected>Pertinence (Défaut)</option>
                        <option value="stars">Étoiles</option>
                        <option value="forks">Forks</option>
                        <option value="updated">Dernière mise à jour</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="order-select">Ordre</label>
                    <select id="order-select" disabled>
                        <option value="desc" selected>Décroissant</option>
                        <option value="asc">Croissant</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="per-page-select">Résultats / page</label>
                    <select id="per-page-select">
                        <option value="30">30</option>
                        <option value="50">50</option>
                        <option value="100" selected>100 (Max)</option>
                    </select>
                </div>

                <!-- PÉRIMÈTRE DE RECHERCHE (IN:) -->
                <div class="filter-group">
                    <label>Chercher dans (in:)</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" class="in-field-checkbox" value="name" checked> Nom</label>
                        <label><input type="checkbox" class="in-field-checkbox" value="description" checked> Description</label>
                        <label><input type="checkbox" class="in-field-checkbox" value="readme"> README</label>
                    </div>
                </div>

                <!-- PROPRIÉTAIRES ET SUJETS -->
                <div class="filter-group">
                    <label for="topic-input">Topic / Sujet (topic:)</label>
                    <input type="text" id="topic-input" placeholder="ex: jekyll, react, game">
                </div>

                <div class="filter-group">
                    <label for="user-input">Utilisateur (user:)</label>
                    <input type="text" id="user-input" placeholder="ex: octocat">
                </div>

                <div class="filter-group">
                    <label for="org-input">Organisation (org:)</label>
                    <input type="text" id="org-input" placeholder="ex: github">
                </div>

                <div class="filter-group">
                    <label for="org-input">Location (loc:)</label>
                    <input type="text" id="location-input" placeholder="ex: dallas">
                </div>

                <!-- PROPRIÉTÉS DU DÉPÔT -->
                <div class="filter-group">
                    <label for="license-select">Licence (license:)</label>
                    <select id="license-select">
                        <option value="" selected>Toutes les licences</option>
                        <option value="mit">MIT</option>
                        <option value="apache-2.0">Apache 2.0</option>
                        <option value="gpl-3.0">GPL v3</option>
                        <option value="bsd-3-clause">BSD 3-Clause</option>
                        <option value="unlicense">Unlicense</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="fork-select">Dépôts Forkés (fork:)</label>
                    <select id="fork-select">
                        <option value="" selected>Exclure les forks (Défaut)</option>
                        <option value="true">Inclure les forks</option>
                        <option value="only">Uniquement les forks</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="archived-select">Dépôts Archivés (archived:)</label>
                    <select id="archived-select">
                        <option value="" selected>Tous</option>
                        <option value="false">Exclure les archivés</option>
                        <option value="true">Uniquement les archivés</option>
                    </select>
                </div>

                <!-- MÉTRIQUES SUPPLÉMENTAIRES -->
                <div class="filter-group">
                    <label for="forks-count-input">Nombre de Forks (forks:)</label>
                    <input type="text" id="forks-count-input" placeholder="ex: >10, 5..50">
                </div>

                <div class="filter-group">
                    <label for="size-input">Taille en Ko (size:)</label>
                    <input type="text" id="size-input" placeholder="ex: >1000, 100..5000">
                </div>

                <div class="filter-group">
                    <label for="followers-input">Followers auteur (followers:)</label>
                    <input type="text" id="followers-input" placeholder="ex: >50">
                </div>

                <!-- FILTRE ÉTOILES -->
                <div class="filter-group">
                    <label for="stars-mode-select">Filtre d'étoiles (stars:)</label>
                    <select id="stars-mode-select">
                        <option value="none" selected>Pas de filtre</option>
                        <option value="min">Minimum (>=)</option>
                        <option value="range">Intervalle (Min .. Max)</option>
                        <option value="raw">Saisie libre (ex: >10)</option>
                    </select>

                    <div id="stars-controls-container" class="sub-container hidden">
                        <div id="stars-mode-min" class="hidden">
                            <input type="number" id="stars-min-input" min="0" placeholder="Min. d'étoiles (ex: 5)">
                        </div>
                        <div id="stars-mode-range" class="input-group hidden">
                            <input type="number" id="stars-range-min" min="0" placeholder="Min">
                            <span>..</span>
                            <input type="number" id="stars-range-max" min="0" placeholder="Max">
                        </div>
                        <div id="stars-mode-raw" class="hidden">
                            <input type="text" id="stars-raw-input" placeholder="ex: >10, 5..50">
                        </div>
                    </div>
                </div>

                <!-- EMPREINTES TECHNIQUES ET FICHIERS MULTIPLES -->
                <div class="filter-group full-width">
                    <label for="tech-signature-input">Empreintes techniques / Qualificateurs bruts (ex: path:, filename:)</label>
                    <div class="input-group">
                        <select id="tech-operator-select" style="width: auto;">
                            <option value="AND" selected>ET (Obligatoire)</option>
                            <option value="OR">OU (Optionnel)</option>
                            <option value="NOT">EXCLURE (NOT)</option>
                        </select>
                        <input type="text" id="tech-signature-input" placeholder="ex: filename:package.json, path:docs">
                        <button type="button" id="add-signature-btn" class="btn-secondary">Ajouter</button>
                    </div>
                    <div id="signatures-tags-list" class="lang-tags-container"></div>
                </div>

                <!-- FILTRE LANGAGE -->
                <div class="filter-group full-width">
                    <label for="lang-mode-select">Filtre Langage (language:)</label>
                    <select id="lang-mode-select">
                        <option value="single" selected>Un seul langage</option>
                        <option value="multi">Avancé (Multi-langages)</option>
                        <option value="raw">Saisie libre brute</option>
                    </select>

                    <div id="lang-controls-container" class="sub-container">
                        <div id="lang-mode-single">
                            <input type="text" id="lang-single-input" list="languages-list" placeholder="ex: go, python, typescript...">
                        </div>

                        <div id="lang-mode-multi" class="hidden">
                            <div class="input-group">
                                <select id="lang-operator-select" style="width: auto;">
                                    <option value="AND" selected>ET (+)</option>
                                    <option value="OR">OU (,)</option>
                                </select>
                                <input type="text" id="lang-multi-input" list="languages-list" placeholder="Ajouter un langage...">
                                <button type="button" id="add-lang-btn" class="btn-secondary">Ajouter</button>
                            </div>
                            <div id="lang-tags-list" class="lang-tags-container"></div>
                        </div>

                        <div id="lang-mode-raw" class="hidden">
                            <input type="text" id="pushed-lang-raw" placeholder="ex: go,python">
                        </div>

                        <datalist id="languages-list">
                            <option value="go"></option>
                            <option value="python"></option>
                            <option value="javascript"></option>
                            <option value="typescript"></option>
                            <option value="html"></option>
                            <option value="css"></option>
                            <option value="rust"></option>
                            <option value="ruby"></option>
                        </datalist>
                    </div>
                </div>

                <!-- FILTRE DATE CRÉATION (CREATED) -->
                <div class="filter-group full-width">
                    <label for="created-date-input">Filtre Date de Création (created:)</label>
                    <input type="text" id="created-date-input" placeholder="ex: >=2024-01-01 ou 2023-01-01..2023-12-31">
                </div>

                <!-- FILTRE DATE DERNIER PUSH (PUSHED) -->
                <div class="filter-group full-width">
                    <label for="pushed-mode-select">Filtre Date de Dernier Push (pushed:)</label>
                    <select id="pushed-mode-select">
                        <option value="none" selected>Aucun filtre</option>
                        <option value="single">Date précise & Opérateur</option>
                        <option value="range">Intervalle (Du ... Au ...)</option>
                        <option value="relative">Raccourcis temporels</option>
                        <option value="raw">Saisie libre brute</option>
                    </select>

                    <div id="date-controls-container" class="sub-container hidden">
                        <div id="mode-single" class="input-group hidden">
                            <select id="pushed-op-select">
                                <option value=">=" selected>&gt;=</option>
                                <option value=">">&gt;</option>
                                <option value="<=">&lt;=</option>
                                <option value="<">&lt;</option>
                                <option value="=">=</option>
                            </select>
                            <input type="date" id="pushed-date-input">
                        </div>

                        <div id="mode-range" class="input-group hidden">
                            <select id="pushed-start-op">
                                <option value=">=" selected>&gt;=</option>
                                <option value=">">&gt;</option>
                            </select>
                            <input type="date" id="pushed-start-date" placeholder="Début">
                            <select id="pushed-end-op">
                                <option value="<=" selected>&lt;=</option>
                                <option value="<">&lt;</option>
                            </select>
                            <input type="date" id="pushed-end-date" placeholder="Fin">
                        </div>

                        <div id="mode-relative" class="hidden">
                            <select id="pushed-relative-select">
                                <option value="7d">Les 7 derniers jours</option>
                                <option value="30d" selected>Les 30 derniers jours</option>
                                <option value="90d">Les 3 derniers mois</option>
                                <option value="1y">La dernière année</option>
                                <option value="this-year">Depuis le début de cette année</option>
                            </select>
                        </div>

                        <div id="mode-raw" class="hidden">
                            <input type="text" id="pushed-raw-input" placeholder="ex: >=2024-01-01">
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </form>

</div>

<div id="status"></div>
<ul class="results-list" id="results"></ul>

<div class="pagination hidden" id="pagination">
    <div class="pagination-controls">
        <button id="prev-btn">« Précédent</button>
        <button id="next-btn">Suivant »</button>
    </div>

    <form class="jump-box" id="jump-form">
        <span class="page-info">Page</span>
        <input type="number" id="page-input" min="1" value="1" required>
        <span class="page-info" id="max-page-info">sur 1</span>
        <button type="submit" id="jump-btn" class="btn-primary">Aller</button>
    </form>

</div>
