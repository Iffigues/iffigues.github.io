---
layout: default
title: Recherche GitHub Pages
---

<style>
  .search-container {
    display: flex;
    gap: 10px;
    margin-bottom: 25px;
  }
  .search-input {
    flex: 1;
    padding: 10px 14px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  .search-btn {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #2da44e;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }
  .search-btn:hover {
    background-color: #2c974b;
  }
  .domain-card {
    background: #ffffff;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .domain-title {
    font-size: 20px;
    font-weight: bold;
    color: #0969da;
    text-decoration: none;
  }
  .domain-title:hover {
    text-decoration: underline;
  }
  .domain-badge {
    background: #ddf4ff;
    color: #0969da;
    font-size: 12px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 12px;
    margin-left: 8px;
  }
  .sub-urls {
    margin-top: 15px;
    padding-left: 15px;
    border-left: 2px solid #e1e4e8;
    list-style: none;
  }
  .sub-urls li {
    margin-bottom: 12px;
  }
  .sub-urls a {
    font-weight: 500;
    color: #1f2328;
    text-decoration: none;
  }
  .sub-urls a:hover {
    color: #0969da;
    text-decoration: underline;
  }
  .sub-url-link {
    color: #57606a;
    font-size: 12px;
    display: block;
    margin-top: 2px;
  }
</style>

<div class="search-container">
  <input type="text" id="queryInput" class="search-input" placeholder="Entrez un pseudo ou un sujet..." onkeypress="if(event.key==='Enter') search()">
  <button onclick="search()" class="search-btn">Chercher</button>
</div>

<div id="status" style="margin-bottom: 15px; font-style: italic; color: #57606a;"></div>
<div id="results"></div>

<script>
// Proxy CORS pour effectuer les requêtes côté serveur comme le Go
const PROXY = "https://api.allorigins.win/get?url=";

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function fetchPageInfo(url, fallbackTitle) {
  try {
    const resp = await fetch(`${PROXY}${encodeURIComponent(url)}`);
    if (!resp.ok) return null;

    const data = await resp.json();
    const htmlText = data.contents;

    if (!htmlText || htmlText.length === 0) return null;

    // Récupération du <title> HTML
    const match = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
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

  statusDiv.textContent = 'Recherche et vérification des pages en cours...';
  resultsDiv.innerHTML = '';

  const cleanQuery = query.toLowerCase().replace(/\s+/g, '');
  const domains = {}; // { domainKey: [ { url, title } ] }

  function addPage(domainKey, pageObj) {
    domains[domainKey] = domains[domainKey] || [];
    if (!domains[domainKey].some(p => p.url === pageObj.url)) {
      domains[domainKey].push(pageObj);
    }
  }

  // 1. Test de la racine utilisateur (https://user.github.io/)
  if (!query.includes(' ')) {
    const userDomain = `${cleanQuery}.github.io`;
    const rootUrl = `https://${userDomain}/`;
    const rootInfo = await fetchPageInfo(rootUrl, userDomain);
    if (rootInfo) {
      addPage(userDomain, rootInfo);
    }
  }

  // 2. Interrogation de l'API Search GitHub
  try {
    const apiURL = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+in:name,description,readme+has:pages&per_page=100`;
    const apiResp = await fetch(apiURL);

    if (apiResp.ok) {
      const data = await apiResp.json();

      if (data.items && data.items.length > 0) {
        // Traitement parallèle (équivalent des goroutines)
        const tasks = data.items.map(async (repo) => {
          const pageUrl = `https://${repo.owner.login}.github.io/${repo.name}/`;
          const domainKey = `${repo.owner.login}.github.io`;

          const info = await fetchPageInfo(pageUrl, `${repo.owner.login}/${repo.name}`);
          if (info) {
            addPage(domainKey, info);
          }
        });

        await Promise.all(tasks);
      }
    }
  } catch (err) {
    console.error("Erreur API GitHub:", err);
  }

  // 3. Rendu
  statusDiv.textContent = '';
  const domainNames = Object.keys(domains);

  if (domainNames.length === 0) {
    resultsDiv.innerHTML = '<p>Aucun résultat fonctionnel trouvé.</p>';
    return;
  }

  domainNames.forEach(domain => {
    const pages = domains[domain];
    
    // Si https://domain/ existe on l'utilise, sinon on prend la 1ère sous-page
    const rootPage = pages.find(p => p.url === `https://${domain}/`);
    const mainUrl = rootPage ? rootPage.url : pages[0].url;

    let pagesHtml = pages.map(p => `
      <li>
        <a href="${p.url}" target="_blank">📄 ${escapeHtml(p.title)}</a>
        <span class="sub-url-link">${p.url}</span>
      </li>
    `).join('');

    const card = document.createElement('div');
    card.className = 'domain-card';
    card.innerHTML = `
      <div>
        <a href="${mainUrl}" target="_blank" class="domain-title">🌐 ${domain}</a>
        <span class="domain-badge">${pages.length} page(s)</span>
      </div>
      <ul class="sub-urls">
        ${pagesHtml}
      </ul>
    `;

    resultsDiv.appendChild(card);
  });
}
</script>
