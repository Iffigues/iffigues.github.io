---
layout: default
title: Détail du Projet 42
custom_css:
  - /assets/css/42.css
  - /assets/css/42profile.css
custom_js:
  - /assets/js/42project-detail.js
---

<div class="page-42-wrapper">
    <header class="section-header">
        <h1 id="project-title"><span class="glitch">42</span> : Chargement...</h1>
        <div class="main-nav-buttons">
            <a href="{{ '/42profil' | relative_url }}"><button class="btn-42">⬅️ Retour au Profil</button></a>
        </div>
    </header>

    <!-- Bloc informations du projet (Statut & Note) -->
    <div id="project-meta-card" class="content-card">
        <div class="parcours">
            <h2>📊 Informations du Projet</h2>
            <div id="project-meta-info">
                <p>Chargement des informations...</p>
            </div>
        </div>
    </div>

    <!-- Bloc description (s'affiche uniquement si une description existe) -->
    <div id="project-description-card" class="content-card" style="display: none;">
        <div class="parcours">
            <h2>📖 Description du Projet</h2>
            <p id="project-description-text"></p>
        </div>
    </div>

    <div class="content-card">
        <div class="parcours">
            <h2>📝 Commentaires de correction</h2>
            <div id="project-evaluations">
                <p>Chargement des commentaires...</p>
            </div>
        </div>
    </div>

</div>
