/* assets/js/pdf-viewer.js */

class DynamicPDFViewer {
    constructor() {
        this.states = {};
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            const pdfViewers = document.querySelectorAll('.pdf-viewer');
            
            if (pdfViewers.length === 0) return;

            // Initialisation des états pour chaque conteneur PDF
            pdfViewers.forEach(viewer => {
                const key = viewer.dataset.pdfKey;
                const src = viewer.dataset.pdfSrc;
                const canvas = viewer.querySelector('canvas');

                if (key && src && canvas) {
                    this.states[key] = {
                        src: window.siteBaseUrl + src,
                        pdfDoc: null,
                        pageNum: 1,
                        pageCount: 0,
                        canvas: canvas,
                        key: key
                    };
                }
            });

            // Écouteurs sur les boutons d'onglets
            document.querySelectorAll('.tab-btn[data-pdf-target]').forEach(btn => {
                btn.addEventListener('click', () => this.showPDF(btn.dataset.pdfTarget));
            });

            // Écouteurs sur les commandes de navigation (Précédent / Suivant)
            document.querySelectorAll('[data-pdf-action]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.pdfAction;
                    const key = btn.dataset.pdfKey;
                    if (action === 'prev') this.prevPage(key);
                    if (action === 'next') this.nextPage(key);
                });
            });

            // Afficher le premier PDF disponible par défaut
            const firstKey = Object.keys(this.states)[0];
            if (firstKey && typeof pdfjsLib !== 'undefined') {
                this.showPDF(firstKey);
            }
        });
    }

    renderPage(key) {
        const state = this.states[key];
        if (!state || !state.pdfDoc) return;

        state.pdfDoc.getPage(state.pageNum).then(page => {
            const viewport = page.getViewport({ scale: 1.5 });
            const ctx = state.canvas.getContext('2d');
            state.canvas.height = viewport.height;
            state.canvas.width = viewport.width;

            page.render({ canvasContext: ctx, viewport: viewport });

            const numEl = document.getElementById(`page-num-${key}`);
            const countEl = document.getElementById(`page-count-${key}`);
            if (numEl) numEl.textContent = state.pageNum;
            if (countEl) countEl.textContent = state.pageCount;
        });
    }

    showPDF(key) {
        // Masquer tous les viewers et afficher le ciblé
        Object.keys(this.states).forEach(k => {
            const viewerEl = document.getElementById(`pdf-${k}`);
            if (viewerEl) viewerEl.style.display = (k === key) ? 'block' : 'none';
        });

        // Mettre à jour la classe active sur les onglets
        document.querySelectorAll('.tab-btn[data-pdf-target]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.pdfTarget === key);
        });

        const state = this.states[key];
        if (!state) return;

        // Charger le document si ce n'est pas encore fait
        if (!state.pdfDoc) {
            pdfjsLib.getDocument(state.src).promise.then(pdf => {
                state.pdfDoc = pdf;
                state.pageCount = pdf.numPages;
                this.renderPage(key);
            });
        }
    }

    prevPage(key) {
        const state = this.states[key];
        if (state && state.pageNum > 1) {
            state.pageNum--;
            this.renderPage(key);
        }
    }

    nextPage(key) {
        const state = this.states[key];
        if (state && state.pageNum < state.pageCount) {
            state.pageNum++;
            this.renderPage(key);
        }
    }
}

// Instanciation automatique du lecteur
window.pdfViewerInstance = new DynamicPDFViewer();