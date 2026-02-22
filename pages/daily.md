---
layout: default
title: Daily
---

  
  <center>
  <button onclick="loadRandomVideo()">Charger une vidéo aléatoire</button>
  <div id="iframeContainer" style="margin-top: 20px;"></div>
  </center>

  <script>
    async function loadRandomVideo() {
      const iframeContainer = document.getElementById("iframeContainer");
      iframeContainer.innerHTML = "<p>Chargement...</p>";

      try {
        const response = await fetch("https://api.dailymotion.com/videos?limit=50&fields=id,title&sort=random");
        const data = await response.json();

        if (data.list.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.list.length);
          const video = data.list[randomIndex];

          const embedUrl = `https://www.dailymotion.com/embed/video/${video.id}`;
          const iframeHTML = `
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
          iframeContainer.innerHTML = iframeHTML;
        } else {
          iframeContainer.innerHTML = "<p>Aucune vidéo trouvée.</p>";
        }
      } catch (error) {
        iframeContainer.innerHTML = "<p>Erreur lors du chargement de la vidéo.</p>";
        console.error(error);
      }
    }
    loadRandomVideo()
  </script>


