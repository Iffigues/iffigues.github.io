---
layout: default
title: Galerie Photos
custom_css:
  - /assets/css/photos.css
custom_js:
  - /assets/js/gallery-modal.js
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
  <img class="modal-content" id="full-image" alt="Agrandissement de la photo">
  <span class="nav-arrow next">&#10095;</span>
</div>
