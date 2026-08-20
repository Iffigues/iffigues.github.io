document.addEventListener('DOMContentLoaded', () => {
    const btnParcours = document.getElementById('btn-parcours');
    const btnDocs = document.getElementById('btn-documents');
    const sectionParcours = document.getElementById('comment');
    const sectionDocs = document.getElementById('pdf');

    if (btnParcours && sectionParcours && sectionDocs) {
        btnParcours.addEventListener('click', () => {
            sectionParcours.style.display = 'block';
            sectionDocs.style.display = 'none';
        });
    }

    if (btnDocs && sectionParcours && sectionDocs) {
        btnDocs.addEventListener('click', () => {
            sectionDocs.style.display = 'block';
            sectionParcours.style.display = 'none';
        });
    }
});