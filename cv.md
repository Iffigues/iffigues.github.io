---
layout: default
title: CV
---

<div id="pdf-a" class="pdf-container">
<canvas id="pdf-canvas"></canvas>
<div>
  <button onclick="prevPage('a')">◀️ Précédent</button>
  <span id="page-num-a"></span> / <span id="page-count-a"></span>
  <button onclick="nextPage('a')">Suivant ▶️</button>
</div>
</div>

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
      const scale = 1.5;
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
</script>


<script>
  if (window.location.href.includes("jo")) {
    document.body.style.backgroundImage = "url('assets/data/jo/img/bg.jpg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
  }
</script>