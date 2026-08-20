/* assets/js/pages/jo.js */

const pdfFiles = {
    a: window.siteBaseUrl + '/assets/data/jo/pdf/certOLY.pdf',
    b: window.siteBaseUrl + '/assets/data/jo/pdf/certPARA.pdf',
    c: window.siteBaseUrl + '/assets/data/jo/pdf/faitEn.pdf',
    d: window.siteBaseUrl + '/assets/data/jo/pdf/faitFR.pdf',
    e: window.siteBaseUrl + '/assets/data/jo/pdf/mec.pdf'
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
        btn.classList.toggle('active', btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${key}'`));
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

document.addEventListener('DOMContentLoaded', () => {
    // Appliquer le thème sombre à la page
    //document.body.classList.add('dark-theme');

    // Gestion des boutons de bascule
    const btnParcours = document.getElementById('btn-parcours');
    const btnDocs = document.getElementById('btn-documents');

    if (btnParcours) {
        btnParcours.onclick = () => {
            document.getElementById('comment').style.display = 'block';
            document.getElementById('pdf').style.display = 'none';
        };
    }

    if (btnDocs) {
        btnDocs.onclick = () => {
            document.getElementById('pdf').style.display = 'block';
            document.getElementById('comment').style.display = 'none';
        };
    }

    // Chargement du premier PDF
    if (typeof pdfjsLib !== 'undefined') {
        showPDF('a');
    }
});