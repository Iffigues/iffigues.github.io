/* assets/js/42.js */

const pdfFiles = {
    a: (window.siteBaseUrl || '') + '/assets/data/42/pdf/certLvL22.pdf',
    b: (window.siteBaseUrl || '') + '/assets/data/42/pdf/certRNCP.pdf',
    c: (window.siteBaseUrl || '') + '/assets/data/42/pdf/cursus.pdf'
};

const pdfStates = {
    a: { pdfDoc: null, pageNum: 1, pageCount: 0 },
    b: { pdfDoc: null, pageNum: 1, pageCount: 0 },
    c: { pdfDoc: null, pageNum: 1, pageCount: 0 }
};

function renderPage(key) {
    const state = pdfStates[key];
    if (!state.pdfDoc) return;

    state.pdfDoc.getPage(state.pageNum).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
        const container = document.getElementById(`pdf-${key}`);
        const canvas = container ? container.querySelector('canvas') : null;
        
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        page.render({ canvasContext: ctx, viewport: viewport });
        
        const numEl = document.getElementById(`page-num-${key}`);
        const countEl = document.getElementById(`page-count-${key}`);
        if (numEl) numEl.textContent = state.pageNum;
        if (countEl) countEl.textContent = state.pageCount;
    });
}

function showPDF(key) {
    ['a', 'b', 'c'].forEach(k => {
        const el = document.getElementById(`pdf-${k}`);
        if (el) el.style.display = (k === key) ? 'block' : 'none';
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-pdf-target') === key);
    });

    if (!pdfStates[key].pdfDoc && typeof pdfjsLib !== 'undefined') {
        pdfjsLib.getDocument(pdfFiles[key]).promise.then(pdf => {
            pdfStates[key].pdfDoc = pdf;
            pdfStates[key].pageCount = pdf.numPages;
            renderPage(key);
        });
    }
}

function prevPage(key) { 
    if (pdfStates[key].pageNum > 1) { 
        pdfStates[key].pageNum--; 
        renderPage(key); 
    } 
}

function nextPage(key) { 
    if (pdfStates[key].pageNum < pdfStates[key].pageCount) { 
        pdfStates[key].pageNum++; 
        renderPage(key); 
    } 
}

document.addEventListener('DOMContentLoaded', () => {
    // Bascule des sections (Parcours / Documents)
    const btnParcours = document.getElementById('btn-parcours');
    const btnDocs = document.getElementById('btn-documents');
    const sectionParcours = document.getElementById('comment');
    const sectionDocs = document.getElementById('pdf');
    
    if (btnParcours) {
        btnParcours.addEventListener('click', () => {
            if (sectionParcours) sectionParcours.style.display = 'block';
            if (sectionDocs) sectionDocs.style.display = 'none';
        });
    }
    
    if (btnDocs) {
        btnDocs.addEventListener('click', () => {
            if (sectionDocs) sectionDocs.style.display = 'block';
            if (sectionParcours) sectionParcours.style.display = 'none';
        });
    }

    // Gestion des onglets PDF
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-pdf-target');
            if (target) showPDF(target);
        });
    });

    // Controles Précédent / Suivant du PDF
    document.querySelectorAll('[data-pdf-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-pdf-action');
            const key = btn.getAttribute('data-pdf-key');
            if (action === 'prev') prevPage(key);
            if (action === 'next') nextPage(key);
        });
    });

    // Chargement du premier PDF
    if (typeof pdfjsLib !== 'undefined') {
        showPDF('a');
    }
});