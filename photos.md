---
layout: default
title: Galerie Photos
---

# 📸 Ma Galerie

<hr>
<div class="gallery-grid">
  {% for file in site.static_files %}
    {% if file.path contains '/assets/data/eglise/img/napt/' %}
      <div class="gallery-item">
        <img src="{{ file.path | relative_url }}" alt="Photo de mon parcours" loading="lazy">
      </div>
    {% endif %}
  {% endfor %}
</div>

<div id="image-modal" class="modal">
  <span class="close-modal">&times;</span>
  <img class="modal-content" id="full-image">
</div>

<style>
  /* --- GRILLE DES PHOTOS --- */
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 20px 0;
  }

  .gallery-item {
    overflow: hidden;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    height: 300px;
    background: #e0e0e0;
  }

  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    cursor: zoom-in;
    transition: transform 0.5s ease;
  }

  .gallery-item:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 20px rgba(0,0,0,0.2);
  }

  .gallery-item:hover img {
    transform: scale(1.1);
  }

  /* --- STYLE DE L'AGRANDISSEMENT (PLEIN ÉCRAN) --- */
  .modal {
    display: none;
    position: fixed;
    z-index: 99999;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.95); /* Noir profond pour immersion */
    backdrop-filter: blur(10px); /* Flou sur le site en arrière-plan */
    cursor: zoom-out;
  }

  .modal-content {
    margin: auto;
    display: block;
    width: auto;
    height: auto;
    max-width: 98%; /* Utilise presque toute la largeur */
    max-height: 98%; /* Utilise presque toute la hauteur */
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    object-fit: contain; /* L'image s'affiche en entier sans être coupée */
    border-radius: 4px;
    box-shadow: 0 0 40px rgba(0,0,0,0.8);
    animation: fastZoom 0.25s ease-out;
  }

  @keyframes fastZoom {
    from { transform: translateY(-50%) scale(0.85); opacity: 0; }
    to { transform: translateY(-50%) scale(1); opacity: 1; }
  }

  .close-modal {
    position: absolute;
    top: 15px;
    right: 25px;
    color: #ffffff;
    font-size: 45px;
    font-weight: bold;
    cursor: pointer;
    text-shadow: 0 0 10px rgba(0,0,0,0.5);
    z-index: 100000;
  }

  /* Responsive pour mobile */
  @media (max-width: 600px) {
    .gallery-grid {
      grid-template-columns: 1fr;
    }
    .modal-content {
      max-width: 100%;
      max-height: 90%;
    }
  }
</style>

<script>
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("full-image");
  const closeModal = document.querySelector(".close-modal");

  // On attache l'événement à toutes les images
  document.querySelectorAll(".gallery-item img").forEach(img => {
    img.onclick = function(e) {
      e.stopPropagation();
      modal.style.display = "block";
      modalImg.src = this.src;
      document.body.style.overflow = "hidden"; // Empêche de scroller le site derrière
    }
  });

  // Fermer quand on clique sur le fond ou l'image
  modal.onclick = function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Rend le scroll au site
  }
  
  // Fermer avec la touche Echap
  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
</script>