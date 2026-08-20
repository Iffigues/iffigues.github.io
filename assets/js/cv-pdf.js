/* assets/js/cv-pdf.js */

document.addEventListener('DOMContentLoaded', () => {
    const pdfContainer = document.getElementById('pdf-a');
    if (!pdfContainer) return;

    const pdfUrl = pdfContainer.getAttribute('data-pdf-src');
    const canvas = document.getElementById('pdf-canvas');
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const pageNumEl = document.getElementById('page-num-a');
    const pageCountEl = document.getElementById('page-count-a');

    if (!pdfUrl || !canvas) return;

    let pdfDoc = null;
    let pageNum = 1;
    let pageCount = 0;

    // Configuration du worker PDF.js
    if (typeof pdfjsLib !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    function renderPage(num) {
        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: 1.5 });
            const ctx = canvas.getContext('2d');
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            page.render(renderContext);

            if (pageNumEl) pageNumEl.textContent = num;
            if (pageCountEl) pageCountEl.textContent = pageCount;
        });
    }

    function prevPage() {
        if (pageNum <= 1) return;
        pageNum--;
        renderPage(pageNum);
    }

    function nextPage() {
        if (pageNum >= pageCount) return;
        pageNum++;
        renderPage(pageNum);
    }

    if (prevBtn) prevBtn.addEventListener('click', prevPage);
    if (nextBtn) nextBtn.addEventListener('click', nextPage);

    // Chargement du document
    pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
        pdfDoc = pdf;
        pageCount = pdf.numPages;
        renderPage(pageNum);
    }).catch(err => {
        console.error('❌ Erreur chargement PDF :', err);
    });
});