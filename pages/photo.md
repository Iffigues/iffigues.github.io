---
layout: default
title: Photos de mon Église
custom_css: /assets/css/church-gallery.css
---

# {{ page.title }}

<div class="church-gallery">
  {% for file in site.static_files %}
    {% if file.path contains 'old/assets/data/photo/new/new' %}
      {% assign ext = file.extname | downcase %}
      {% if ext == '.jpg' or ext == '.jpeg' or ext == '.png' or ext == '.webp' %}
        
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
