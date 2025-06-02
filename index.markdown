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
    <h1>Bonjour, je suis {{ site.author.name | default: "Moi" }}</h1>
    <p>Développeur passionné par le web, les projets innovants et l'apprentissage continu.</p>
  </div>

  <div class="section">
    <h2>🚀 Projets</h2>
    <div class="projects">
      <div class="card">
        <h3>Site Blog Jekyll</h3>
        <p>Un blog statique construit avec Jekyll et GitHub Pages.</p>
        <a href="/blog">Voir le blog</a>
      </div>
      <div class="card">
        <h3>Visionneur PDF JS</h3>
        <p>Lecteur de fichiers PDF interactif avec navigation par page.</p>
      </div>
      <div class="card">
        <h3>Parcours 42</h3>
        <p>Présentation de mon apprentissage à l'école 42 avec certificats intégrés.</p>
        <a href="/42">Voir le parcours</a>
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

  <div class="section contact">
    <h2>📬 Contact</h2>
    <p>Tu peux me contacter via : <a href="mailto:monemail@example.com">monemail@example.com</a></p>
  </div>

</div>