---
layout: default
title: Profil 42
custom_css:
  - /assets/css/42.css
  - /assets/css/42profile.css
custom_js:
  - /assets/js/badge.js
  - /assets/js/42profile.js
---

<div class="page-42-wrapper">
        <header class="section-header">
        <h1><span class="glitch">42</span> : Le cursus</h1>
        <div class="main-nav-buttons">
        <a href="{{ '/42' | relative_url }}"><button id="btn-projects" class="btn-42">42</button></a>
            <a href="{{ '/42project' | relative_url }}"><button id="btn-projects" class="btn-42">Mes Projets 42</button></a>
            <a href="{{ '/42profil' | relative_url }}"><button id="btn-profil" class="btn-42">Profil</button></a>
            <a href="{{ '/42time' | relative_url }}"><button id="btn-profil" class="btn-42">Time</button></a>
            <a href="{{ '/42coalition' | relative_url }}"><button id="btn-profil" class="btn-42">Coalitions</button></a>
        </div>
    </header>
    <!-- 1. MON PROFIL -->
    <details id="profile-card" class="content-card" open>
        <summary class="accordion-header">
            <h2>👤 Mon Profil</h2>
        </summary>
        <div class="story-layout">
            <div class="image-container">
                <img id="user-avatar" src="{{ '/assets/data/42/img/bordenoy.webp' | relative_url }}" alt="Photo de profil" class="profile-img">
            </div>
            <div class="text-content">
                <section class="parcours">
                    <div id="profile-details">
                        <p><strong>Login :</strong> <span id="user-login">bordenoy</span></p>
                        <p><strong>Titres :</strong> <span id="user-titles">Chargement...</span></p>
                        <p><strong>Niveau :</strong> <span id="user-level">Chargement...</span></p>
                        <p><strong>Points de correction :</strong> <span id="user-eval-points">-</span></p>
                        <p><strong>Wallet :</strong> <span id="user-wallet">-</span> ₳</p>
                        <p><strong>Statut / Post :</strong> <span id="user-location">Hors campus</span></p>
                    </div>
                </section>
            </div>
        </div>
    </details>

    <!-- 2. MES BADGES -->
    <details id="badges-card" class="content-card" open>
        <summary class="accordion-header">
            <h2>🏅 Mes Badges & Achievements</h2>
        </summary>
        <section class="parcours">
            <div id="badges-container" class="badges-container">
                <p>Chargement des badges...</p>
            </div>
        </section>
    </details>

    <!-- 3. MES PROJETS -->
    <details id="projects-card" class="content-card" open>
        <summary class="accordion-header">
            <h2>🚀 Mes Projets</h2>
        </summary>
        <section class="parcours">
            <div id="projects-container" class="projects-grid">
                <p>Chargement des projets...</p>
            </div>
        </section>
    </details>

    <!-- 4. TOP COMPÉTENCES -->
    <details id="skills-card" class="content-card" open>
        <summary class="accordion-header">
            <h2>💡 Top Compétences</h2>
        </summary>
        <section class="parcours">
            <div id="skills-container" class="skills-container">
                <p>Chargement des compétences...</p>
            </div>
        </section>
    </details>

    <!-- 5. MES PARTENARIATS / COLLABORATIONS -->
    <details id="partnerships-card" class="content-card" open>
        <summary class="accordion-header">
            <h2>🤝 Partenariats & Collaborations</h2>
        </summary>
        <section class="parcours">
            <div id="partnerships-container" class="partnerships-grid">
                <p>Chargement des partenariats...</p>
            </div>
        </section>
    </details>

    <!-- 6. MES ÉVÉNEMENTS -->
    <details id="events-card" class="content-card" open>
        <summary class="accordion-header">
            <h2>📅 Mes Événements</h2>
        </summary>
        <section class="parcours">
            <div id="events-container" class="events-grid">
                <p>Chargement des événements...</p>
            </div>
        </section>
    </details>



    <!-- Modal Détails Projet -->
    <div id="project-modal" class="project-modal" style="display:none;">
        <div class="project-modal-content">
            <span class="project-modal-close">&times;</span>
            <div id="project-modal-body">
                <!-- Rempli dynamiquement au clic -->
            </div>
        </div>
    </div>

    <!-- Modal Détails Événement -->
    <div id="event-modal" class="event-modal" style="display:none;">
        <div class="event-modal-content">
            <span class="event-modal-close">&times;</span>
            <div id="event-modal-body">
                <!-- Rempli dynamiquement au clic -->
            </div>
        </div>
    </div>

</div>
