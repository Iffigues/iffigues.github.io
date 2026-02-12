---
layout: none
permalink: /l
---

  <title>Compte à rebours bapteme</title>
 <link rel="icon" type="image/png" href="/assets/img/fav.png">
<link rel="stylesheet" href="/assets/css/style.css">
  <script src="https://cdn.jsdelivr.net/npm/luxon@3/build/global/luxon.min.js"></script>
  <div id="river">
  <h1>Temps restant avant le BAPTEME :</h1>
  <div><h1 id="countdown"></h1></div>
  <img src="{{ '/assets/data/eglise/img/fav.png' | relative_url }}"> 
  </div>
  <script>
    const DateTime = luxon.DateTime;
    const targetDate = DateTime.fromISO("2075-04-19T20:00:00", { zone: "Europe/Paris" });

    function updateCountdown() {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        document.getElementById("countdown").innerHTML = "🎉 Bon Renouveau!";
        clearInterval(timer);
        return;
      }

      const seconds = Math.floor(diff / 1000) % 60;
      const minutes = Math.floor(diff / (1000 * 60)) % 60;
      const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      document.getElementById("countdown").innerHTML =
        `${days}j ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown(); 
    const timer = setInterval(updateCountdown, 1000);
  </script>
