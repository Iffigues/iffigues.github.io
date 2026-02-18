    const toggleBtn = document.getElementById('accordion-toggle');
    const menu = document.getElementById('accordion-menu');

    toggleBtn.addEventListener('click', function () {
      const isOpen = menu.style.display === 'block';
      menu.style.display = isOpen ? 'none' : 'block';
      toggleBtn.setAttribute('aria-expanded', !isOpen);
    });