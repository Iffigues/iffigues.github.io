/* assets/js/dailymotion-random.js */

document.addEventListener('DOMContentLoaded', () => {
    const iframeContainer = document.getElementById('iframeContainer');
    const loadBtn = document.getElementById('btn-load-video');

    async function loadRandomVideo() {
        if (!iframeContainer) return;

        iframeContainer.innerHTML = '<p>Chargement...</p>';

        try {
            const response = await fetch('https://api.dailymotion.com/videos?limit=50&fields=id,title&sort=random');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            if (data.list && data.list.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.list.length);
                const video = data.list[randomIndex];

                const embedUrl = `https://www.dailymotion.com/embed/video/${video.id}`;
                iframeContainer.innerHTML = `
                    <iframe 
                        id="dmPlayer"
                        frameborder="0"
                        width="560"
                        height="315"
                        src="${embedUrl}"
                        allow="autoplay"
                        allowfullscreen
                    ></iframe>
                `;
            } else {
                iframeContainer.innerHTML = '<p>Aucune vidéo trouvée.</p>';
            }
        } catch (error) {
            iframeContainer.innerHTML = '<p>Erreur lors du chargement de la vidéo.</p>';
            console.error('❌ Erreur Dailymotion API :', error);
        }
    }

    if (loadBtn) {
        loadBtn.addEventListener('click', loadRandomVideo);
    }

    // Chargement automatique d'une vidéo au lancement
    loadRandomVideo();
});