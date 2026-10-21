---
layout: default
title: Profil 42 — Temps & Connexions
custom_css:
  - /assets/css/42/42.css
  - /assets/css/42/42time.css
custom_js:
  - /assets/js/42/42time.js
---

<div class="page-42-wrapper">
  <header class="section-header">
    <h1><span class="glitch">42</span> : Temps sur site & Historique</h1>
    <div class="main-nav-buttons">
      <a href="{{ '/42' | relative_url }}"><button id="btn-projects" class="btn-42">42</button></a>
      <a href="{{ '/42profil' | relative_url }}"><button id="btn-profil" class="btn-42">Profil</button></a>
      <a href="{{ '/42coalition' | relative_url }}"><button id="btn-coalition" class="btn-42">Coalitions</button></a>
    </div>
  </header>

  <!-- Conteneur ciblé par /assets/js/42/42time.js pour injecter la timeline -->
  <main class="timeline-section">
    <div id="timeline-history"></div>
  </main>
</div>
