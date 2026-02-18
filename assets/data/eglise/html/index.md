---
layout: none
permalink: /bapteme-timer
---

  <title>Compte à rebours bapteme</title>
 <link rel="icon" type="image/png" href="/assets/img/fav.webp">
<link rel="stylesheet" href="/assets/css/style.css">
  <script src="https://cdn.jsdelivr.net/npm/luxon@3/build/global/luxon.min.js"></script>
  <div id="river">
  <h1>Temps restant avant le BAPTEME :</h1>
  <div><h1 id="countdown"></h1></div>
  <img src="{{ '/assets/data/eglise/img/fav.webp' | relative_url }}"> 
  </div>
  <script>
const DateTime = luxon.DateTime;

// Fonction pour calculer la date de Pâques (Algorithme de Meeus/Jones/Butcher)
function getEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    // Le baptême a lieu le samedi soir (Vigile Pascale), donc Pâques - 1 jour
    return DateTime.fromObject({ year, month, day, hour: 20 }, { zone: "Europe/Paris" }).minus({ days: 1 });
}

function getNextBaptismDate() {
    const now = DateTime.now().setZone("Europe/Paris");
    let target = getEasterSunday(now.year);

    // Si la date du baptême de cette année est déjà passée, on prend celle de l'année prochaine
    if (now > target) {
        target = getEasterSunday(now.year + 1);
    }
    return target;
}

let targetDate = getNextBaptismDate();

function updateCountdown() {
    const now = DateTime.now().setZone("Europe/Paris");
    const diff = targetDate.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();

    if (targetDate.diff(now).milliseconds <= 0) {
        document.getElementById("countdown").innerHTML = "🎉 Bon Renouveau !";
        // On recalcule la date pour l'année suivante après un petit délai
        setTimeout(() => { targetDate = getNextBaptismDate(); }, 5000);
        return;
    }

    // Formatage de l'affichage
    const d = Math.floor(diff.days);
    const h = Math.floor(diff.hours);
    const m = Math.floor(diff.minutes);
    const s = Math.floor(diff.seconds);

    document.getElementById("countdown").innerHTML = `${d}j ${h}h ${m}m ${s}s`;
}

updateCountdown();
const timer = setInterval(updateCountdown, 1000);
  </script>
