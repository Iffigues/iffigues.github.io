---
layout: default
title: School 42 parcour
---

<script src="{{ '/assets/js/api/api.js' | relative_url }}"></script>




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

<style>
.profile-container {
  background: #1e1e2e; /* Couleur sombre type éditeur */
  color: white;
  padding: 20px;
  border-radius: 12px;
  max-width: 400px;
  border: 1px solid #00babc; /* Le fameux bleu 42 */
  font-family: 'Inter', sans-serif;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #00babc;
  object-fit: cover;
}

.login-tag {
  background: #00babc;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  font-weight: bold;
}

.level-container { margin-top: 15px; width: 100%; }
.progress-bar-bg {
  background: #3e3e4e;
  border-radius: 10px;
  height: 12px;
  width: 100%;
  overflow: hidden;
}
.progress-bar-fill {
  background: #00babc; /* Bleu 42 */
  height: 100%;
  width: 0%; /* Sera mis à jour par le JS */
  transition: width 1s ease-in-out;
}
</style>