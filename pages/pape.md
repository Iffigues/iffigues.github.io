---
layout: default
title: Volontaire - Visite Papale
custom_css:
  - /assets/css/pape.css
custom_js:
  - "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
  - /assets/js/pdf.js
  - /assets/js/toggle.js
---

<div class="page-jo-wrapper">
    <header class="section-header">
        <h1>Visite Papale 2026 : <span class="highlight">Volontaire</span></h1>
        <div class="main-nav-buttons">
            <button id="btn-parcours" class="btn-jo">🙏 Mon Engagement</button>
            <button id="btn-documents" class="btn-jo">📄 Documents Officiels</button>
        </div>
    </header>

    <div id="comment" class="content-card">
        <!-- 🖼️ Image 1 : Bandeau rectangulaire supérieur -->
        <div class="pape-banner-container">
            <img src="{{ '/assets/data/pape/img/headerPape.webp' | relative_url }}" alt="Visite Papale 2026" class="pape-banner-img">
        </div>

        <div class="story-layout vertical-layout">
            <div class="text-content">
                <section id="parcours-jo" class="parcours">
                    <h2>🕊️ Accueil & Déambulation</h2>
                    <p>À l'occasion de la venue du Pape Léon XIV en France, j'ai rejoint l'équipe des volontaires pour participer à l'organisation et à l'accueil du public lors des grands événements à Paris et au Stade de France.</p>

                    <p class="timeline"><strong>25 — 26 Septembre 2026 :</strong> Deux jours d'engagement au cœur du pôle Déambulation.</p>

                    <p>Rattaché au pôle <strong>3 - Déambulation - Accueil, Messe</strong>, mes missions se sont déroulées sur deux vacations :</p>
                    <ul>
                        <li><strong>Vendredi 25 Septembre (10h30 - 17h00) :</strong> Orientation des pèlerins vers les accès de la Zone 4 (Équipe Flux Amont Zone D).</li>
                        <li><strong>Samedi 26 Septembre (07h00 - 18h00) :</strong> Assistance logistique au point Eucharistie / Communion (Zone E Nord - Tente N°11).</li>
                    </ul>
                </section>
            </div>

            <!-- 🖼️ Image 2 : Image d'illustration inférieure -->
            <div class="image-container bottom-image-container">
                <img src="{{ '/assets/data/pape/img/volontairePape.webp' | relative_url }}" alt="Volontaire Pape Léon XIV" class="pape-bottom-img">
                <p class="img-caption">Accueil et logistique — Paris 2026</p>
            </div>
        </div>
    </div>

    <div id="pdf" class="content-card" style="display:none;">
        <div class="pdf-tabs">
            <button class="tab-btn active" data-pdf-target="a">Contremarque Accréditation</button>
            <button class="tab-btn" data-pdf-target="b">Fiches d'Affectation</button>
        </div>

        {% assign pdf_list = "a,b" | split: "," %}
        {% assign pdf_names = "c,a" | split: "," %}

        {% for key in pdf_list %}
        {% assign index = forloop.index0 %}
        {% assign pdf_filename = pdf_names[index] | append: '.pdf' %}
        {% assign pdf_path = '/assets/data/eglise/pdf/' | append: pdf_filename %}

        <div id="pdf-{{ key }}" class="pdf-viewer" data-pdf-key="{{ key }}" data-pdf-src="{{ pdf_path }}" style="{% if key != 'a' %}display:none;{% endif %}">
            <canvas></canvas>
            <div class="pdf-toolbar">
                <button class="ctrl-btn" data-pdf-action="prev" data-pdf-key="{{ key }}">◀️</button>
                <span class="page-info"><span id="page-num-{{ key }}"></span> / <span id="page-count-{{ key }}"></span></span>
                <button class="ctrl-btn" data-pdf-action="next" data-pdf-key="{{ key }}">▶️</button>
                <a href="{{ pdf_path | relative_url }}" download class="btn-download">💾 Télécharger</a>
            </div>
        </div>
        {% endfor %}
    </div>

</div>
