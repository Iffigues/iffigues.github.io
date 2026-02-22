---
layout: default
title: JO
---
<link rel="stylesheet" href="{{ '/assets/css/theme-dark.css' | relative_url }}">
<script>document.body.classList.add('dark-theme');</script>
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
            <button class="tab-btn active" onclick="showPDF('a')">Certif. OLY</button>
            <button class="tab-btn" onclick="showPDF('b')">Certif. PARA</button>
            <button class="tab-btn" onclick="showPDF('c')">J'ai fait les Jeux (EN)</button>
            <button class="tab-btn" onclick="showPDF('d')">J'ai fait les Jeux (FR)</button>
            <button class="tab-btn" onclick="showPDF('e')">Club Paris 2024</button>
        </div>

        {% assign pdf_list = "a,b,c,d,e" | split: "," %}
        {% assign pdf_names = "certOLY,certPARA,faitEn,faitFR,mec" | split: "," %}

        {% for key in pdf_list %}
        {% assign index = forloop.index0 %}
        <div id="pdf-{{ key }}" class="pdf-viewer" style="{% if key != 'a' %}display:none;{% endif %}">
            <canvas id="pdf-canvas{% if key != 'a' %}{{ index }}{% endif %}"></canvas>
            <div class="pdf-toolbar">
                <button onclick="prevPage('{{ key }}')" class="ctrl-btn">◀️</button>
                <span class="page-info"><span id="page-num-{{ key }}"></span> / <span id="page-count-{{ key }}"></span></span>
                <button onclick="nextPage('{{ key }}')" class="ctrl-btn">▶️</button>
                <a href="{{ '/assets/data/jo/pdf/' | append: pdf_names[index] | append: '.pdf' | relative_url }}" download class="btn-download">💾 Télécharger</a>
            </div>
        </div>
        {% endfor %}
    </div>
</div>

<style>
/* --- VARIABLES & BASE --- */
:root {
    --jo-purple: #6e3e91;
    --jo-pink: #ff007a;
    --jo-gold: #d7c378;
    --jo-bg-card: rgba(255, 255, 255, 0.92);
}

body {
    background: url('{{ "/assets/data/jo/img/bg.webp" | relative_url }}') no-repeat center center fixed;
    background-size: cover;
    margin: 0;
}



.page-jo-wrapper {
    max-width: 1100px;
    margin: 40px auto;
    padding: 20px;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    min-height: 100vh;
}

/* --- HEADER --- */
.section-header h1 {
    font-size: 3rem;
    text-align: center;
    margin-bottom: 30px;
    color: white !important;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 2px 2px 15px rgba(0, 0, 0, 0.7);
}

.highlight { color: var(--jo-pink); }

/* --- BOUTONS --- */
.main-nav-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 40px;
}

.btn-jo {
    background: white;
    border: 2px solid var(--jo-purple);
    color: var(--jo-purple);
    padding: 12px 25px;
    font-weight: bold;
    cursor: pointer;
    border-radius: 50px;
    transition: 0.3s;
}

.btn-jo:hover {
    background: var(--jo-purple);
    color: white;
    box-shadow: 0 4px 15px rgba(110, 62, 145, 0.4);
}

/* --- CONTENU --- */
.content-card {
    background: var(--jo-bg-card);
    border-radius: 20px;
    padding: 35px;
    box-shadow: 0 15px 45px rgba(0,0,0,0.2);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255,255,255,0.3);
}

.story-layout {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 40px;
    align-items: start;
}

.profile-img {
    width: 100%;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    border: 3px solid white;
}

.img-caption {
    text-align: center;
    font-size: 0.85rem;
    color: #555;
    margin-top: 10px;
    font-style: italic;
}

.timeline {
    padding: 15px;
    background: #fdf2f8;
    border-left: 5px solid var(--jo-pink);
    border-radius: 4px;
    color: #333;
}

/* --- PDF TABS --- */
.pdf-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 25px;
    justify-content: center;
}

.tab-btn {
    background: #eee;
    border: none;
    padding: 10px 20px;
    border-radius: 30px;
    cursor: pointer;
    font-weight: 600;
    transition: 0.3s;
}

.tab-btn.active {
    background: var(--jo-purple);
    color: white;
}

/* --- PDF VIEWER --- */
.pdf-viewer { text-align: center; }

canvas {
    max-width: 100%;
    height: auto !important;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    background: white;
}

.pdf-toolbar {
    margin-top: 20px;
    display: inline-flex;
    align-items: center;
    gap: 20px;
    background: #222;
    padding: 12px 30px;
    border-radius: 50px;
    color: white;
}

.ctrl-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
}

.btn-download {
    color: var(--jo-gold) !important;
    text-decoration: none;
    font-weight: bold;
    border: 1px solid var(--jo-gold);
    padding: 4px 12px;
    border-radius: 4px;
}

@media (max-width: 768px) {
    .story-layout { grid-template-columns: 1fr; }
    .section-header h1 { font-size: 2rem; }
}
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
    const pdfFiles = {
        a: '{{ "/assets/data/jo/pdf/certOLY.pdf" | relative_url }}',
        b: '{{ "/assets/data/jo/pdf/certPARA.pdf" | relative_url }}',
        c: '{{ "/assets/data/jo/pdf/faitEn.pdf" | relative_url }}',
        d: '{{ "/assets/data/jo/pdf/faitFR.pdf" | relative_url }}',
        e: '{{ "/assets/data/jo/pdf/mec.pdf" | relative_url }}'
    };

    const pdfStates = {
        a: { pdfDoc: null, pageNum: 1, pageCount: 0, canvasId: 'pdf-canvas' },
        b: { pdfDoc: null, pageNum: 1, pageCount: 0, canvasId: 'pdf-canvas1' },
        c: { pdfDoc: null, pageNum: 1, pageCount: 0, canvasId: 'pdf-canvas2' },
        d: { pdfDoc: null, pageNum: 1, pageCount: 0, canvasId: 'pdf-canvas3' },
        e: { pdfDoc: null, pageNum: 1, pageCount: 0, canvasId: 'pdf-canvas4' }
    };

    function renderPage(key) {
        const state = pdfStates[key];
        state.pdfDoc.getPage(state.pageNum).then(page => {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.getElementById(state.canvasId);
            const ctx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            page.render({ canvasContext: ctx, viewport: viewport });
            document.getElementById(`page-num-${key}`).textContent = state.pageNum;
            document.getElementById(`page-count-${key}`).textContent = state.pageCount;
        });
    }

    function showPDF(key) {
        Object.keys(pdfFiles).forEach(k => {
            const el = document.getElementById(`pdf-${k}`);
            if (el) el.style.display = (k === key) ? 'block' : 'none';
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('onclick').includes(`'${key}'`));
        });

        if (!pdfStates[key].pdfDoc) {
            pdfjsLib.getDocument(pdfFiles[key]).promise.then(pdf => {
                pdfStates[key].pdfDoc = pdf;
                pdfStates[key].pageCount = pdf.numPages;
                renderPage(key);
            });
        }
    }

    function prevPage(key) { if (pdfStates[key].pageNum > 1) { pdfStates[key].pageNum--; renderPage(key); } }
    function nextPage(key) { if (pdfStates[key].pageNum < pdfStates[key].pageCount) { pdfStates[key].pageNum++; renderPage(key); } }

    window.onload = () => { showPDF('a'); };

    document.getElementById('btn-parcours').onclick = () => {
        document.getElementById('comment').style.display = 'block';
        document.getElementById('pdf').style.display = 'none';
    };
    document.getElementById('btn-documents').onclick = () => {
        document.getElementById('pdf').style.display = 'block';
        document.getElementById('comment').style.display = 'none';
    };
</script>