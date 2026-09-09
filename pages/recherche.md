---
layout: default
title: recherche
title: Moteur de recherche GitHub
---

<div class="search-container">
  <input type="text" id="queryInput" placeholder="Entrez un nom ou un sujet..." onkeypress="if(event.key==='Enter') search()">
  <button onclick="search()">Chercher</button>
</div>

<div id="status"></div>
<div id="results"></div>

<script>
async function fetchPageInfo(url, fallbackTitle) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const text = await response.text();
    const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = (match && match[1]) ? match[1].trim() : fallbackTitle;
    return { url, title };
  } catch (err) {
    return null;
  }
}

async function search() {
  const query = document.getElementById('queryInput').value.trim();
  const statusDiv = document.getElementById('status');
  const resultsDiv = document.getElementById('results');

  if (!query) return;

  statusDiv.textContent = 'Recherche en cours...';
  resultsDiv.innerHTML = '';

  const cleanQuery = query.toLowerCase().replace(/\s+/g, '');
  const domains = {};

  // 1. Racine utilisateur
  const userRootUrl = `https://${cleanQuery}.github.io/`;
  const rootInfo = await fetchPageInfo(userRootUrl, `${cleanQuery}.github.io`);
  if (rootInfo) {
    domains[`${cleanQuery}.github.io`] = [rootInfo];
  }

  // 2. Recherche API GitHub
  try {
    const apiURL = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+in:name,description,readme+has:pages&per_page=30`;
    const apiResp = await fetch(apiURL);

    if (apiResp.ok) {
      const data = await apiResp.json();
      const checks = data.items.map(async (repo) => {
        const pageUrl = `https://${repo.owner.login}.github.io/${repo.name}/`;
        const domainKey = `${repo.owner.login}.github.io`;
        const info = await fetchPageInfo(pageUrl, `${repo.owner.login}/${repo.name}`);
        if (info) {
          domains[domainKey] = domains[domainKey] || [];
          if (!domains[domainKey].some(p => p.url === info.url)) {
            domains[domainKey].push(info);
          }
        }
      });
      await Promise.all(checks);
    }
  } catch (err) {
    console.error("Erreur API GitHub:", err);
  }

  statusDiv.textContent = '';
  const domainNames = Object.keys(domains);

  if (domainNames.length === 0) {
    resultsDiv.innerHTML = '<p>Aucune page fonctionnelle trouvée.</p>';
    return;
  }

  domainNames.forEach(domain => {
    const pages = domains[domain];
    const rootPage = pages.find(p => p.url === `https://${domain}/`);
    const mainUrl = rootPage ? rootPage.url : pages[0].url;

    let pagesHtml = pages.map(p => `
      <li>
        <a href="${p.url}" target="_blank">📄 ${p.title}</a>
        <br><small>${p.url}</small>
      </li>
    `).join('');

    const card = document.createElement('div');
    card.style.cssText = "background:#fff; border:1px solid #ccc; padding:15px; margin-bottom:15px; border-radius:6px;";
    card.innerHTML = `
      <h3>🌐 <a href="${mainUrl}" target="_blank">${domain}</a> (${pages.length} page(s))</h3>
      <ul>${pagesHtml}</ul>
    `;
    resultsDiv.appendChild(card);
  });
}
</script>
