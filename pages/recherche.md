---
layout: default
title: Recherche GitHub Pages
custom_css:
  - /assets/css/github-search.css
custom_js:
  - /assets/js/github-search.js
---

<h1>Recherche de GitHub Pages</h1>

<div class="search-container">
    <form id="search-form">
        <div class="search-box">
            <input type="text" id="query-input" placeholder="Ex: school, portfolio, game..." required>
            <button type="submit" id="search-btn" class="btn-primary">Chercher</button>
        </div>

        <button type="button" id="toggle-filters-btn" class="toggle-filters-btn" aria-expanded="false" aria-controls="collapsible-filters">
            <span class="toggle-icon">▶</span> Filtres avancés
        </button>

        <div id="collapsible-filters" class="collapsible-filters">
            <div class="filters-grid">
                <div class="filter-group">
                    <label for="sort-select">Trier par</label>
                    <select id="sort-select">
                        <option value="" selected>Aucun tri (Pertinence)</option>
                        <option value="stars">Étoiles</option>
                        <option value="forks">Forks</option>
                        <option value="updated">Dernière MàJ</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="order-select">Ordre</label>
                    <select id="order-select" disabled>
                        <option value="desc">Décroissant</option>
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

                <!-- FILTRE ÉTOILES -->
                <div class="filter-group">
                    <label for="stars-mode-select">Filtre d'étoiles (Stars)</label>
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

                <!-- FILTRE DE RECHERCHE TECHNIQUE ET EMPREINTES MULTIPLES -->
                <div class="filter-group full-width">
                    <label for="tech-signature-input">Empreintes techniques / Fichiers / Topics</label>
                    <div class="input-group">
                        <select id="tech-operator-select" style="width: auto;">
                            <option value="AND" selected>ET (Obligatoire)</option>
                            <option value="OR">OU (Optionnel)</option>
                            <option value="NOT">EXCLURE (NOT)</option>
                        </select>
                        <input type="text" id="tech-signature-input" placeholder="ex: filename:package.json, path:docs, topic:react...">
                        <button type="button" id="add-signature-btn" class="btn-secondary">Ajouter</button>
                    </div>

                    <!-- Zone d'affichage des signatures ajoutées -->
                    <div id="signatures-tags-list" class="lang-tags-container"></div>
                </div>

                <!-- FILTRE LANGAGE MULTI-OPERATEUR -->
                <div class="filter-group full-width">
                    <label for="lang-mode-select">Filtre Langage (Opérateurs AND / OR / NOT)</label>
                    <select id="lang-mode-select">
                        <option value="single" selected>Un seul langage (Standard)</option>
                        <option value="multi">Avancé (Combinaison multi-langages)</option>
                        <option value="raw">Saisie libre brute</option>
                    </select>

                    <div id="lang-controls-container" class="sub-container">
                        <!-- Mode Single -->
                        <div id="lang-mode-single">
                            <input type="text" id="lang-single-input" list="languages-list" placeholder="ex: go, python, typescript...">
                        </div>

                        <!-- Mode Multi / Opérateurs -->
                        <div id="lang-mode-multi" class="hidden">
                            <div class="input-group">
                                <select id="lang-operator-select" style="width: auto;">
                                    <option value="AND" selected>ET (Obligatoire)</option>
                                    <option value="OR">OU (Optionnel)</option>
                                    <option value="NOT">EXCLURE (NOT)</option>
                                </select>
                                <input type="text" id="lang-multi-input" list="languages-list" placeholder="Ajouter un langage...">
                                <button type="button" id="add-lang-btn" class="btn-secondary">Ajouter</button>
                            </div>
                            <div id="lang-tags-list" class="lang-tags-container"></div>
                        </div>

                        <!-- Mode Raw -->
                        <div id="lang-mode-raw" class="hidden">
                            <input type="text" id="pushed-lang-raw" placeholder="ex: language:go OR language:python NOT language:html">
                        </div>

                        <datalist id="languages-list">
                            <option value="">-- Tous les langages --</option>
                            <option value="go"></option>
                            <option value="python"></option>
                            <option value="javascript"></option>
                            <option value="typescript"></option>
                            <option value="php"></option>
                            <option value="html"></option>
                            <option value="css"></option>
                            <option value="rust"></option>
                            <option value="c"></option>
                            <option value="cpp"></option>
                            <option value="csharp"></option>
                            <option value="java"></option>
                            <option value="shell"></option>
                            <option value="ruby"></option>
                            <option value="dart"></option>
                            <option value="zig"></option>
                        </datalist>
                    </div>
                </div>

                <!-- FILTRE DATE -->
                <div class="filter-group full-width">
                    <label for="pushed-mode-select">Filtre de date (Dernier push)</label>
                    <select id="pushed-mode-select">
                        <option value="none" selected>Aucun filtre de date</option>
                        <option value="single">Date précise & Opérateur</option>
                        <option value="range">Intervalle personnalisé (Du ... Au ...)</option>
                        <option value="relative">Raccourcis temporels (ex: 7 derniers jours)</option>
                        <option value="raw">Saisie libre brute (Syntaxe GitHub native)</option>
                    </select>

                    <div id="date-controls-container" class="sub-container hidden">
                        <div id="mode-single" class="input-group hidden">
                            <select id="pushed-op-select">
                                <option value=">=" selected>&gt;= (À partir de)</option>
                                <option value=">">&gt; (Strictement après)</option>
                                <option value="<=">&lt;= (Jusqu'à)</option>
                                <option value="<">&lt; (Strictement avant)</option>
                                <option value="=">= (Exactement ce jour)</option>
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
                            <input type="text" id="pushed-raw-input" placeholder="ex: 2024-01-01..2024-06-30 ou >=2024-01-01">
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