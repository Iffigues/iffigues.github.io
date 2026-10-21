document.addEventListener("DOMContentLoaded", () => {
  // Chargement des données JSON depuis le fichier du site
  fetch('/assets/data/42/user_data.json')
    .then(response => response.json())
    .then(data => {
      if (data && data.locations) {
        renderConnectionHistory(data.locations);
      }
    })
    .catch(err => console.error("Erreur de chargement des données 42:", err));
});

function renderConnectionHistory(locations) {
  const container = document.getElementById("timeline-history") || document.querySelector(".page-42-wrapper");
  if (!container) return;

  // Structure des données agglomérées par année
  const statsByYear = {};
  let totalHoursAll = 0;
  let totalSessions = locations.length;

  locations.forEach(loc => {
    const start = new Date(loc.begin_at);
    const end = new Date(loc.end_at);
    const durationHours = (end - start) / (1000 * 60 * 60);
    const year = start.getFullYear();
    const dateStr = start.toISOString().split('T')[0];

    totalHoursAll += durationHours;

    if (!statsByYear[year]) {
      statsByYear[year] = {
        totalHours: 0,
        sessionsCount: 0,
        activeDays: new Set(),
        hosts: {}
      };
    }

    statsByYear[year].totalHours += durationHours;
    statsByYear[year].sessionsCount += 1;
    statsByYear[year].activeDays.add(dateStr);
    
    const host = loc.host;
    statsByYear[year].hosts[host] = (statsByYear[year].hosts[host] || 0) + durationHours;
  });

  // Construction du HTML
  const yearsSorted = Object.keys(statsByYear).sort((a, b) => b - a);

  let html = `
    <div class="stats-overview-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 2rem 0;">
      <div class="stat-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; text-align: center;">
        <span style="font-size: 1.6rem; font-weight: bold; color: #00babc;">${totalHoursAll.toFixed(1)} h</span>
        <div style="font-size: 0.85rem; opacity: 0.8;">Temps Total Campus</div>
      </div>
      <div class="stat-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; text-align: center;">
        <span style="font-size: 1.6rem; font-weight: bold; color: #00babc;">${totalSessions}</span>
        <div style="font-size: 0.85rem; opacity: 0.8;">Sessions Totales</div>
      </div>
      <div class="stat-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; text-align: center;">
        <span style="font-size: 1.6rem; font-weight: bold; color: #00babc;">${((totalHoursAll * 60) / totalSessions).toFixed(0)} min</span>
        <div style="font-size: 0.85rem; opacity: 0.8;">Moyenne / Session</div>
      </div>
    </div>

    <div class="timeline-wrapper" style="border-left: 2px solid #00babc; padding-left: 1.5rem; margin-top: 2rem;">
  `;

  yearsSorted.forEach(year => {
    const yData = statsByYear[year];
    const topHosts = Object.entries(yData.hosts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([host, hrs]) => `<span class="host-badge" style="background: rgba(0,186,188,0.15); color: #00babc; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85rem; margin-right: 4px;">${host} (${hrs.toFixed(1)}h)</span>`)
      .join(" ");

    html += `
      <div class="timeline-year-block" style="margin-bottom: 2rem; position: relative;">
        <div style="position: absolute; left: -2.05rem; top: 0.3rem; width: 12px; height: 12px; background: #00babc; border-radius: 50%;"></div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1.2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
            <h3 style="margin: 0; font-size: 1.3rem;">${year}</h3>
            <span style="font-weight: bold; color: #00babc;">${yData.totalHours.toFixed(1)} heures</span>
          </div>
          <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.8rem;">
            <span><strong>${yData.sessionsCount}</strong> sessions</span> • 
            <span><strong>${yData.activeDays.size}</strong> jours actifs</span> • 
            <span>Moyenne : <strong>${(yData.totalHours / yData.activeDays.size).toFixed(1)} h/jour</strong></span>
          </div>
          <div style="font-size: 0.85rem;">
            <div style="opacity: 0.7; margin-bottom: 0.3rem;">Postes les plus squattés :</div>
            <div>${topHosts}</div>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.insertAdjacentHTML("beforeend", html);
}