---
layout: default
title: eglise
---

<section class="personal-story">

  <!-- Image bannière -->
  <div class="story-hero">
    <img src="{{ '/assets/data/eglise/img/bapteme.jpg' | relative_url }}"
         alt="Voyage à Rome et Vatican"
         class="hero-image">
  </div>

  <!-- Contenu texte -->
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
  </div>

  <!-- Vidéo -->
  <!-- https://geo.dailymotion.com/player.html?video=x9zewlw -->
  <!-- https://www.youtube.com/embed/dTdJ73QXIow -->
   <!-- https://www.youtube.com/embed/hiWxM_m9RAI?si=Mosq370D1WKuAvQn -->
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
    <h3>📽️ La bougie du baptême </h3>
    <div class="video-container">
      <iframe
        src="https://www.youtube.com/embed/hiWxM_m9RAI?si=Mosq370D1WKuAvQn"
        title="Vidéo de la messe"
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

.story-text .lead {
  font-size: 1.1rem;
}

.highlight-date {
  font-weight: bold;
}

/* Section vidéo */
.story-video {
  margin: 60px 0 40px;
  text-align: center;
}

/* Conteneur vidéo PLUS LARGE que le texte */
.video-container {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  max-width: 1200px;
}

/* Vidéo responsive */
.video-container iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.25);
}
</style>
