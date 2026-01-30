---
layout: default
title: JO
---

# J'ai fait les Jeux
<div>
  <button id="btn-parcours">Mon parcours</button>
  <button id="btn-documents">Mes Documents</button>
</div>
<div id="comment">
  <img src="{{ '/assets/data/jo/img/voitureJO.jpg' | relative_url }}" alt="Voiture JO">
  <div class="text">
 <section id="parcours-jo" class="parcours">
  <h2>🚗 Mon Parcours de Chauffeur Volontaire – JO & Paralympiques</h2>

  <p>
    Mon engagement a commencé par une inscription en ligne sur la plateforme des volontaires dédiée aux Jeux Olympiques et Paralympiques de Paris 2024. Après avoir rempli mon profil, passé les étapes de sélection et validé les formations en ligne, j'ai été retenu comme chauffeur volontaire.
  </p>

  <p>
    Ma mission s'est déroulée de <strong>fin juillet à mi-septembre</strong>, couvrant une période intense entre le  début Jeux Olympiques jusqu'à la fin des Jeux Paralympiques.
  </p>

  <p>
    En tant que chauffeur, j’ai eu la responsabilité de transporter des officiels, des membres de délégations et parfois des athlètes entre les sites olympiques, les hôtels et les centres de logistique. J’ai pu découvrir l’envers du décor d’un événement d’envergure mondiale, travailler en équipe avec des volontaires venus de tous horizons et vivre une expérience humaine inoubliable.
  </p>

  <p>
    Cette expérience m’a permis de développer mon sens de l’organisation, de la ponctualité, ainsi que mes capacités d’adaptation dans un environnement multiculturel et exigeant.
  </p>
  </section>
</div>
</div>
<div id="pdf" style="display: none;">
<div>
  <button onclick="showPDF('a')">Certification de partification Jeux Olympique</button>
  <button onclick="showPDF('b')">Certification de partification Jeux Paralympique</button>
  <button onclick="showPDF('c')">Certifiacation "j'ai fait les Jeux", En</button>
   <button onclick="showPDF('d')">Certifiacation "j'ai fait les Jeux", Fr</button>
  <button onclick="showPDF('e')">Membre émérite du club Paris 2024</button>
</div>


<div id="pdf-a" class="pdf-container">
<canvas id="pdf-canvas"></canvas>
<div>
  <button onclick="prevPage('a')">◀️ Précédent</button>
  <span id="page-num-a"></span> / <span id="page-count-a"></span>
  <button onclick="nextPage('a')">Suivant ▶️</button>
</div>
</div>

<div id="pdf-b" class="pdf-container" style="display:none;">
<canvas id="pdf-canvas1"></canvas>
<div>
  <button onclick="prevPage('b')">◀️ Précédent</button>
  <span id="page-num-b"></span> / <span id="page-count-b"></span>
  <button onclick="nextPage('b')">Suivant ▶️</button>
</div>
</div>

<div id="pdf-c" class="pdf-container" style="display:none;">
<canvas id="pdf-canvas2"></canvas>
<div>
  <button onclick="prevPage('c')">◀️ Précédent</button>
  <span id="page-num-c"></span> / <span id="page-count-c"></span>
  <button onclick="nextPage('c')">Suivant ▶️</button>
</div>
</div>

<div id="pdf-d" class="pdf-container" style="display:none;">
<canvas id="pdf-canvas3"></canvas>
<div>
  <button onclick="prevPage('d')">◀️ Précédent</button>
  <span id="page-num-d"></span> / <span id="page-count-d"></span>
  <button onclick="nextPage('d')">Suivant ▶️</button>
</div>
</div>

<div id="pdf-e" class="pdf-container" style="display:none;">
<canvas id="pdf-canvas4"></canvas>
<div>
  <button onclick="prevPage('e')">◀️ Précédent</button>
  <span id="page-num-e"></span> / <span id="page-count-e"></span>
  <button onclick="nextPage('e')">Suivant ▶️</button>
</div>
</div>
</div>
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
      const scale = 1;
      const viewport = page.getViewport({ scale });
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

  // Chargement initial de chaque PDF
  for (const key in pdfFiles) {
    pdfjsLib.getDocument(pdfFiles[key]).promise.then(pdf => {
      pdfStates[key].pdfDoc = pdf;
      pdfStates[key].pageCount = pdf.numPages;
      renderPage(key);
    }).catch(err => {
      console.error(`Erreur de chargement du PDF (${key}):`, err);
    });
  }



    function showPDF(keyToShow) {
    ['a', 'b', 'c','d','e'].forEach(key => {
      document.getElementById(`pdf-${key}`).style.display = (key === keyToShow) ? 'block' : 'none';
    });

    // Si pas encore chargé, on charge
    const state = pdfStates[keyToShow];
    if (!state.pdfDoc) {
      pdfjsLib.getDocument(pdfFiles[keyToShow]).promise.then(pdf => {
        state.pdfDoc = pdf;
        state.pageCount = pdf.numPages;
        renderPage(keyToShow);
      }).catch(err => {
        console.error(`Erreur de chargement (${keyToShow}) :`, err);
      });
    } else {
      renderPage(keyToShow);
    }
  }
</script>


<script>
  if (window.location.href.includes("jo")) {
    document.body.style.backgroundImage = "url('assets/data/jo/img/bg.jpg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
  }
</script>


<script>
  document.getElementById('btn-parcours').addEventListener('click', () => {
    document.getElementById('comment').style.display = 'block';
    document.getElementById('pdf').style.display = 'none';
  });

  document.getElementById('btn-documents').addEventListener('click', () => {
    document.getElementById('pdf').style.display = 'block';
    document.getElementById('comment').style.display = 'none';
  });
</script>