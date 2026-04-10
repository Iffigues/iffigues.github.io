---
layout: default
title: Photos de mon Église
---

# {{ page.title }}

<div class="church-gallery">
  {% for file in site.static_files %}
    {% if file.path contains 'old/assets/data/pack/' %}
      {% if file.extname == '.JPG' or file.extname == '.jpeg' or file.extname == '.png' or file.extname == '.webp' %}
        
        <div class="gallery-item">
          <img src="{{ file.path | relative_url }}" alt="Photo de l'église" class="gallery-thumb">
          
          <a href="{{ file.path | relative_url }}" 
             download="{{ file.name }}" 
             class="download-button"
             title="Télécharger {{ file.name }}">
             📥 Télécharger
          
          </a>
        </div>

      {% endif %}
    {% endif %}
  {% endfor %}
</div>


<div class="church-gallery">
  {% for file in site.static_files %}
    {% if file.path contains 'old/assets/data/lo/' %}
      {% if file.extname == '.JPG' or file.extname == '.jpeg' or file.extname == '.png' or file.extname == '.webp' %}
        
        <div class="gallery-item">
          <img src="{{ file.path | relative_url }}" alt="Photo de l'église" class="gallery-thumb">
          
          <a href="{{ file.path | relative_url }}" 
             download="{{ file.name }}" 
             class="download-button"
             title="Télécharger {{ file.name }}">
             📥 Télécharger
          
          </a>
        </div>

      {% endif %}
    {% endif %}
  {% endfor %}
</div>

<style>
.church-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.gallery-item {
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.gallery-thumb {
  width: 100%;
  height: 200px;
  object-fit: cover; /* Recadre proprement l'image pour qu'elles aient toutes la même taille */
  border-radius: 4px;
  margin-bottom: 10px;
}

.download-button {
  display: inline-block;
  background: #555; /* Couleur sobre pour l'église */
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.9em;
  font-weight: bold;
}

.download-button:hover {
  background: #333;
}
</style>