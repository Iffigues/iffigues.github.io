---
layout: default
title: Mon CV
custom_css: /assets/css/cv.css
custom_js:
  - https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
  - /assets/js/cv-pdf.js
---

<div class="cv-page-wrapper">
    <header class="section-header">
        <h1>Curriculum <span class="highlight">Vitae</span></h1>
    </header>

    <div class="content-card">
        <div id="pdf-a" class="pdf-container" data-pdf-src="{{ '/assets/data/personnelle/pdf/Profile.pdf' | relative_url }}">
            <canvas id="pdf-canvas"></canvas>

            <div class="pdf-toolbar">
                <button id="btn-prev" class="ctrl-btn">◀️ Précédent</button>

                <span class="page-info">
                    Page <span id="page-num-a">-</span> / <span id="page-count-a">-</span>
                </span>

                <button id="btn-next" class="ctrl-btn">Suivant ▶️</button>

                <a id="download-c" href="{{ '/assets/data/personnelle/pdf/Profile.pdf' | relative_url }}" download class="btn-download">
                    💾 Télécharger
                </a>
            </div>
        </div>
    </div>

</div>
