---
layout: default
title: Galerie Photos
---

# 📸 Ma Galerie

<hr>
<div class="gallery-grid">
  {% for file in site.static_files %}
    {% if file.path contains '/assets/data/eglise/img/noimh/' %}
      <div class="gallery-item">
        <img src="{{ file.path | relative_url }}" alt="Photo de mon parcours" loading="lazy">
      </div>
    {% endif %}
  {% endfor %}
</div>

<div id="image-modal" class="modal">
  <span class="close-modal">&times;</span>
  <span class="nav-arrow prev">&#10094;</span>
  <img class="modal-content" id="full-image">
  <span class="nav-arrow next">&#10095;</span>
</div>

<style>
  /* --- TA GRILLE (Inchangée) --- */
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
  .gallery-item:hover { transform: translateY(-8px); box-shadow: 0 12px 20px rgba(0,0,0,0.2); }
  .gallery-item:hover img { transform: scale(1.1); }

  /* --- MODAL ET FLÈCHES --- */
  .modal {
    display: none;
    position: fixed;
    z-index: 99999;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    cursor: default;
  }

  .modal-content {
    margin: auto;
    display: block;
    max-width: 90%;
    max-height: 90%;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 0 40px rgba(0,0,0,0.8);
    animation: fastZoom 0.25s ease-out;
  }

  /* FLÈCHES DE NAVIGATION */
  .nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: white;
    font-size: 60px;
    font-weight: bold;
    cursor: pointer;
    padding: 20px;
    user-select: none;
    transition: color 0.3s, transform 0.2s;
    z-index: 100001;
  }
  .nav-arrow:hover { color: #3498db; transform: translateY(-50%) scale(1.2); }
  .prev { left: 10px; }
  .next { right: 10px; }

  .close-modal {
    position: absolute;
    top: 15px; right: 25px;
    color: white;
    font-size: 45px;
    cursor: pointer;
    z-index: 100002;
  }

  @keyframes fastZoom {
    from { transform: translateY(-50%) scale(0.85); opacity: 0; }
    to { transform: translateY(-50%) scale(1); opacity: 1; }
  }

  @media (max-width: 600px) {
    .nav-arrow { font-size: 40px; padding: 10px; }
  }
</style>

<script>
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("full-image");
  const images = Array.from(document.querySelectorAll(".gallery-item img"));
  let currentIndex = 0;

  // Fonction pour mettre à jour l'image dans le modal
  function updateModal(index) {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;
    currentIndex = index;
    modalImg.src = images[currentIndex].src;
  }

  // Ouvrir le modal
  images.forEach((img, index) => {
    img.onclick = function() {
      modal.style.display = "block";
      updateModal(index);
      document.body.style.overflow = "hidden";
    }
  });

  // Boutons Suivant / Précédent
  document.querySelector(".next").onclick = (e) => { e.stopPropagation(); updateModal(currentIndex + 1); };
  document.querySelector(".prev").onclick = (e) => { e.stopPropagation(); updateModal(currentIndex - 1); };

  // Fermer le modal
  modal.onclick = function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  // Navigation clavier
  document.addEventListener('keydown', function(e) {
    if (modal.style.display === "block") {
      if (e.key === "ArrowRight") updateModal(currentIndex + 1);
      if (e.key === "ArrowLeft") updateModal(currentIndex - 1);
      if (e.key === "Escape") {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      }
    }
  });
</script>