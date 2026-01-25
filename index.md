---
layout: default
title: Accueil
---

<style>
  .portfolio {
    max-width: 900px;
    margin: auto;
    padding: 2rem;
    font-family: sans-serif;
  }

  .intro {
    text-align: center;
  }

  .intro img {
    width: 150px;
    border-radius: 50%;
    margin-bottom: 1rem;
  }

  .section {
    margin-top: 3rem;
  }

  .projects, .skills {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
  }

  .card {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 1rem;
    background: #fafafa;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  }

  .card img {
    max-width: 100%;
    border-radius: 8px;
  }

  .contact a {
    color: #0077cc;
    text-decoration: none;
  }
</style>

<div class="portfolio">

  <div class="intro">
    <img src="{{ '/assets/data/42/img/bordenoy.jpg' | relative_url }}" alt="Photo de profil">
    <h1>Bienvenu sur mon portofiolio</h1>
    <p>Développeur formé à 42 (lvl 21.76), passionné par les technologies modernes, le DevOps et le CI/CD. Expérience chez l’AFP. Curieux, rigoureux, j’aime résoudre des problèmes complexes en solo ou en équipe.</p>
  </div>

  <div class="section">
    <h2>🚀 Projets</h2>
    <div class="projects">
      <div class="card">
        <h3>Rungly</h3>
        <p>Un Chatbot qui met en contact sprtif et coach sportif.</p>
        
      </div>
      <div class="card">
        <h3>Brainee</h3>
        <p>Start-up créée dans le cadre du launchpad HEC-42</p>
      </div>

    </div>
  </div>

  <div class="section">
    <h2>💻 Compétences</h2>
    <div class="skills">
      <div class="card">HTML / CSS</div>
      <div class="card">JavaScript / PDF.js</div>
      <div class="card">Jekyll / Liquid</div>
      <div class="card">Git / GitHub</div>
      <div class="card">Linux / Terminal</div>
      <div class="card">C / Shell / École 42</div>
    </div>
  </div>

  <div class="section">
    <h2>🧰 Expérience</h2>
    <div class="skills">
      <div class="card">
        <h3>Full-stack Developer</h3>
        <p>développement en interne d'une plateforme de speech to text
développement en interne d'une plateforme de speech to text</p>
<p>Compétences : Linux · Python (langage de programmation) · TypeScript · Développement full-stack · docker · React.js</p>
      </div>
      <div class="card">
        <h3>Développeur Golang - wiseskill</h3>
        <p>conception d'une architecture micro-service en Golang</p>
        <p>Compétences : Linux · API REST · docker · Golang · Microservices</p>
      </div>
        <div class="card">
        <h3>Participation : Jeux Olympiques </h3>
        <p>Conducteur chauffeur volontaire pour les Jeux olympique et paralympique</p>
        
      </div>
      <div class="card">
        <h3>Participation : Jeux Olympiques </h3>
        <p>Conducteur chauffeur volontaire pour les Jeux olympique et paralympique</p>
        
      </div>
    </div>
  </div>

    <div class="section">
    <h2>📓 Parcour Académique</h2>
    <div class="skills">
      <div class="card">
        <h3>École 42</h3>
        <p>Apprentissage intensif en autonomie sur les fondamentaux de la programmation (C, algorithmes, architecture UNIX...)</p>
        <p><strong>Durée :</strong> Depuis 2023</p>
      </div>

    </div>
  </div>

  <div class="section">
    <h2> Permis</h2>
    <div class="skills">
      <div class="card">
        <h3>Permis B 🚗</h3>
        <p>Permis de conduire voiture.</p>
      </div>
      <div class="card">
        <h3>Permis Bateau 🚤</h3>
        <p>Permis Cotier et fluvial.</p>
      </div>
    </div>
  </div>
</div>
