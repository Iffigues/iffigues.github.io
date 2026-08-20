---
layout: default
title: School 42 parcour
custom_css:
  - /assets/css/parcour.css
custom_js:
  - /assets/js/api/api.js
---

<div id="profile-card" class="profile-container">
  <div class="profile-header">
    <img id="user-pic" src="" alt="Photo de profil" class="profile-img">
    <div class="profile-info">
      <h1 id="user-name">Chargement...</h1>
      <p id="user-login" class="login-tag">@login</p>
      <p id="user-email"></p>
    </div>
  </div>
</div>
<div class="level-container">
  <p>Niveau : <span id="user-level-val">0.00</span></p>
  <div class="progress-bar-bg">
    <div id="user-level-bar" class="progress-bar-fill"></div>
  </div>
</div>
<script>
  // On attend que le DOM soit chargé pour éviter l'erreur 'null'
  document.addEventListener('DOMContentLoaded', () => {
    
    // Remplace bien par le chemin réel de ton fichier
    const jsonPath = "/assets/json/denoyelle.json";

    fetchBorisData(jsonPath).then(data => {
      console.log("Données reçues :", data);

      if (data) {
        // 1. On injecte le nom
        const nameEl = document.getElementById('user-name');
        if (nameEl) nameEl.textContent = data.displayname;

        // 2. On injecte la photo (version large)
        const picEl = document.getElementById('user-pic');
        if (picEl) picEl.src = data.image.versions.large;

        // 3. On injecte le login
        const loginEl = document.getElementById('user-login');
        if (loginEl) loginEl.textContent = `@${data.login}`;

        // 4. On injecte l'email
        const emailEl = document.getElementById('user-email');
        if (emailEl) emailEl.textContent = data.email;

      } else {
        console.error("Le fichier JSON n'a pas pu être lu.");
        document.getElementById('user-name').textContent = "Erreur de chargement";
      }

     const mainCursus = data.cursus_users.find(c => c.cursus.slug === "42cursus");

if (mainCursus) {
const level = mainCursus.level; // ex: 22.33

    // 2. Afficher le texte (22.33)
    document.getElementById('user-level-val').textContent = level.toFixed(2);

    // 3. Calculer le % d'avancement (le reste de la division par 1)
    // 22.33 -> 0.33 -> 33%
    const progress = (level % 1) * 100;

    // 4. Animer la barre
    document.getElementById('user-level-bar').style.width = `${progress}%`;

}

    }).catch(err => {
      console.error("Erreur critique :", err);
    });

});
</script>
