/* assets/js/badge.js */

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('badge-modal');
    const modalImg = document.getElementById('badge-modal-img');
    const closeBtn = document.querySelector('.badge-modal-close');

    if (!modal || !modalImg) return;

    // Clic sur une image de badge -> Ouverture
    document.querySelectorAll('.badge-item img').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            modalImg.src = img.src;
            modal.classList.add('active');
        });
    });

    // Fonction de fermeture
    const closeModal = () => modal.classList.remove('active');

    // Fermeture via la croix
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Fermeture au clic à l'extérieur de l'image
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Fermeture avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});