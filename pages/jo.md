---
layout: default
title: JO
custom_css: /assets/css/jo.css
custom_js:
  - /assets/js/pdf.js
  - /assets/js/toggle.js
---

<div class="page-jo-wrapper">
    <header class="section-header">
        <h1>Paris 2024 : <span class="highlight">Volontaire</span></h1>
        <div class="main-nav-buttons">
            <button id="btn-parcours" class="btn-jo">🏅 Mon Parcours</button>
            <button id="btn-documents" class="btn-jo">📄 Certifications</button>
        </div>
    </header>

    <div id="comment" class="content-card">
        <div class="story-layout">
            <div class="image-container">
                <img src="{{ '/assets/data/jo/img/voitureJO.webp' | relative_url }}" alt="Voiture JO" class="profile-img">
                <p class="img-caption">Flotte officielle Paris 2024</p>
            </div>
            <div class="text-content">
                <section id="parcours-jo" class="parcours">
                    <h2>🚗 Chauffeur Volontaire</h2>
                    <p>Mon engagement a débuté par une sélection rigoureuse sur la plateforme des volontaires de <strong>Paris 2024</strong>. Après avoir validé les formations, j'ai eu l'honneur d'être retenu pour les deux sessions.</p>

                    <p class="timeline"><strong>Juillet — Septembre :</strong> Une immersion totale entre le début des JO et la clôture des Paralympiques.</p>

                    <p>Ma mission consistait à transporter officiels, délégations et athlètes. J'ai découvert les coulisses d'un événement mondial, développant adaptabilité et ponctualité dans un cadre multiculturel unique.</p>
                </section>
            </div>
        </div>
    </div>

    <div id="pdf" class="content-card" style="display:none;">
        <div class="pdf-tabs">
            <button class="tab-btn active" data-pdf-target="a">Certif. OLY</button>
            <button class="tab-btn" data-pdf-target="b">Certif. PARA</button>
            <button class="tab-btn" data-pdf-target="c">J'ai fait les Jeux (EN)</button>
            <button class="tab-btn" data-pdf-target="d">J'ai fait les Jeux (FR)</button>
            <button class="tab-btn" data-pdf-target="e">Club Paris 2024</button>
        </div>

        {% assign pdf_list = "a,b,c,d,e" | split: "," %}
        {% assign pdf_names = "certOLY,certPARA,faitEn,faitFR,mec" | split: "," %}

        {% for key in pdf_list %}
        {% assign index = forloop.index0 %}
        {% assign pdf_filename = pdf_names[index] | append: '.pdf' %}
        {% assign pdf_path = '/assets/data/jo/pdf/' | append: pdf_filename %}

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
