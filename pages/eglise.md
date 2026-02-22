---
layout: default
title: eglise
---

<section class="personal-story">

  <div class="story-hero">
    <img src="{{ '/assets/data/eglise/img/bapteme.webp' | relative_url }}" 
         alt="Voyage à Rome et Vatican" 
         class="hero-image">
  </div>

  <div class="story-body">
    <div class="story-header">
      <span class="icon">⛪</span>
      <h1>Un engagement personnel profond</h1>
    </div>

    <div class="story-text">
      <p class="lead">
        Mon parcours de <strong>catéchumène</strong> a débuté en 2023, lors d'un voyage révélateur en 
        <strong>Côte d'Ivoire</strong>. Ce séjour a été le déclencheur d'une volonté profonde de recevoir le baptême.
      </p>

      <p>
        À mon retour en France, j'ai rejoint ma paroisse locale pour entamer un cheminement de deux ans. 
        Ce catéchuménat a été une expérience d'une grande richesse, me permettant de rencontrer des personnes 
        formidables et de vivre des moments forts, notamment lors d'un voyage à 
        <strong>Rome et au Vatican</strong>.
      </p>

      <p class="highlight-date">
        En <strong>2025</strong>, j'ai eu la joie d'être baptisé. Ce fut une étape capitale de ma vie, 
        symbolisant mon engagement et mon intégration au sein de la communauté.
      </p>
    </div>

    <div class="gallery-link-container">
      <a href="{{ '/photos' | relative_url }}" class="btn-gallery">
        📸 Voir l'album photo du baptême
      </a>
    </div>
  </div>

  <div class="story-video">
    <h3>📽️ La célébration : Messe de baptême</h3>
    <div class="video-container">
      <iframe 
        src="https://www.youtube.com/embed/dTdJ73QXIow" 
        title="Vidéo de la messe" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>

    <h3 style="margin-top: 40px;">📽️ La bougie du baptême</h3>
    <div class="video-container">
      <iframe 
        src="https://www.youtube.com/embed/hiWxM_m9RAI?si=Mosq370D1WKuAvQn" 
        title="Vidéo de la bougie" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>
  </div>

</section>

<style>
/* Container principal */
.personal-story {
  max-width: 900px;
  margin: 50px auto;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Image bannière */
.story-hero {
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Texte */
.story-body {
  padding: 40px;
}

.story-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.story-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.icon {
  font-size: 2rem;
}

.story-text p {
  line-height: 1.7;
  margin-bottom: 20px;
  color: #333;
}

/* Style du bouton Galerie */
.gallery-link-container {
  margin-top: 30px;
  text-align: center;
}

.btn-gallery {
  display: inline-block;
  padding: 12px 25px;
  background-color: #0055a4; /* Bleu élégant */
  color: white !important;
  text-decoration: none;
  border-radius: 30px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,85,164,0.3);
}

.btn-gallery:hover {
  background-color: #003d7a;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,85,164,0.4);
}

/* Section vidéo */
.story-video {
  padding: 0 40px 40px;
  text-align: center;
}

.video-container {
  position: relative;
  width: 100%;
  margin-top: 15px;
}

.video-container iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}
</style>