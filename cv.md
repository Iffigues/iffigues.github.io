---
layout: default
title: Mon CV
---

<div class="cv-page-wrapper">
    <header class="section-header">
        <h1>Curriculum <span class="highlight">Vitae</span></h1>
    </header>

    <div class="content-card">
        <div id="pdf-a" class="pdf-container">
            <canvas id="pdf-canvas"></canvas>
            
            <div class="pdf-toolbar">
                <button onclick="prevPage('a')" class="ctrl-btn">◀️ Précédent</button>
                
                <span class="page-info">
                    Page <span id="page-num-a"></span> / <span id="page-count-a"></span>
                </span>
                
                <button onclick="nextPage('a')" class="ctrl-btn">Suivant ▶️</button>
                
                <a id="download-c" href="{{ '/assets/data/personnelle/pdf/Profile.pdf' | relative_url }}" download class="btn-download">
                    💾 Télécharger
                </a>
            </div>
        </div>
    </div>
</div>

<style>
    /* Spécifique à la page CV pour le contraste */
    .cv-page-wrapper {
        max-width: 1000px;
        margin: 40px auto;
        padding: 0 20px;
    }

    .section-header h1 {
        text-align: center;
        margin-bottom: 30px;
        font-size: 2.5rem;
    }

    /* On réutilise tes classes de carte pour la cohérence */
    .content-card {
        background: rgba(255, 255, 255, 0.9);
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        backdrop-filter: blur(5px);
    }

    .highlight {
        color: #0077b5; /* Bleu pro pour le CV */
    }

    /* Toolbar PDF stylisée */
    .pdf-toolbar {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin-top: 20px;
        padding: 15px;
        background: #222;
        border-radius: 50px;
        color: white;
    }

    .ctrl-btn {
        background: none;
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        cursor: pointer;
        transition: 0.3s;
    }

    .ctrl-btn:hover {
        background: rgba(255,255,255,0.1);
    }

    .page-info {
        font-weight: bold;
        min-width: 80px;
        text-align: center;
    }

    canvas {
        display: block;
        margin: 0 auto;
        max-width: 100%;
        height: auto !important;
        border-radius: 4px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
    const pdfFiles = {
        a: '{{ "/assets/data/personnelle/pdf/Profile.pdf" | relative_url }}',
    };

    const pdfStates = {
        a: { pdfDoc: null, pageNum: 1, pageCount: 0, canvasId: 'pdf-canvas' }
    };

    function renderPage(key) {
        const state = pdfStates[key];
        state.pdfDoc.getPage(state.pageNum).then(page => {
            // On ajuste le scale dynamiquement pour la qualité
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.getElementById(state.canvasId);
            const ctx = canvas.getContext('2d');
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            page.render(renderContext);

            document.getElementById(`page-num-${key}`).textContent = state.pageNum;
            document.getElementById(`page-count-${key}`).textContent = state.pageCount;
        });
    }

    function prevPage(key) {
        if (pdfStates[key].pageNum <= 1) return;
        pdfStates[key].pageNum--;
        renderPage(key);
    }

    function nextPage(key) {
        if (pdfStates[key].pageNum >= pdfStates[key].pageCount) return;
        pdfStates[key].pageNum++;
        renderPage(key);
    }

    // Chargement initial
    for (const key in pdfFiles) {
        pdfjsLib.getDocument(pdfFiles[key]).promise.then(pdf => {
            pdfStates[key].pdfDoc = pdf;
            pdfStates[key].pageCount = pdf.numPages;
            renderPage(key);
        }).catch(err => {
            console.error(`Erreur chargement PDF:`, err);
        });
    }
</script>