/* assets/js/gallery-modal.js */

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('full-image');
    const images = Array.from(document.querySelectorAll('.gallery-item img'));
    const prevBtn = document.querySelector('.nav-arrow.prev');
    const nextBtn = document.querySelector('.nav-arrow.next');

    if (!modal || !modalImg || images.length === 0) return;

    let currentIndex = 0;

    function updateModal(index) {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        currentIndex = index;
        modalImg.src = images[currentIndex].src;
    }

    images.forEach((img, index) => {
        img.addEventListener('click', () => {
            modal.style.display = 'block';
            updateModal(index);
            document.body.style.overflow = 'hidden';
        });
    });

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateModal(currentIndex + 1);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateModal(currentIndex - 1);
        });
    }

    modal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block') {
            if (e.key === 'ArrowRight') updateModal(currentIndex + 1);
            if (e.key === 'ArrowLeft') updateModal(currentIndex - 1);
            if (e.key === 'Escape') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });
});