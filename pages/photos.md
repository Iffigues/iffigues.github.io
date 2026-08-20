---
layout: default
title: Galerie Photos
custom_css:
  - /assets/css/photos.css
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
  <span class="nav-arrow prev">&#10094;</span>
  <img class="modal-content" id="full-image">
  <span class="nav-arrow next">&#10095;</span>
</div>

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
