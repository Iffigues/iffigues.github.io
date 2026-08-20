---
layout: default
title: Photos de mon Église
custom_css:
  - /assets/css/paque.css
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
