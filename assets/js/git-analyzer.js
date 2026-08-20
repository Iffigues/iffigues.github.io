/* assets/js/git-analyzer.js */

document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    let currentRepo = "";
    let repoFullTree = [];
    const GITHUB_LIMIT = 5 * 1024 * 1024 * 1024;

    const btnScan = document.getElementById('btn-scan');
    const btnLoadMore = document.getElementById('loadMoreBtn');
    const btnAudit = document.getElementById('btn-audit');
    const btnCloseModal = document.getElementById('btn-close-modal');

    function formatSize(b) {
        if (!b) return '0 B';
        const i = Math.floor(Math.log(b) / Math.log(1024));
        return (b / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    }

    async function initAnalysis(reset = true) {
        if (reset) {
            currentPage = 1;
            document.getElementById('commitList').innerHTML = "";
        }
        const repo = document.getElementById('repoInput').value.trim();
        const token = document.getElementById('tokenInput').value.trim();
        const headers = token ? { "Authorization": `token ${token}` } : {};

        try {
            const rRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
            if (!rRes.ok) throw new Error(`HTTP ${rRes.status}`);
            
            const meta = await rRes.json();
            currentRepo = repo;

            const usedBytes = meta.size * 1024;
            document.getElementById('diskUsed').innerText = formatSize(usedBytes);
            document.getElementById('diskAvail').innerText = formatSize(GITHUB_LIMIT - usedBytes);
            document.getElementById('barUsed').style.width = (usedBytes / GITHUB_LIMIT * 100) + "%";
            
            document.getElementById('disk-section').style.display = 'block';
            document.getElementById('main-view').style.display = 'grid';

            loadNextPage();
        } catch (e) {
            alert("Erreur de connexion à l'API GitHub.");
            console.error(e);
        }
    }

    async function loadNextPage() {
        const token = document.getElementById('tokenInput').value.trim();
        const headers = token ? { "Authorization": `token ${token}` } : {};
        
        try {
            const res = await fetch(`https://api.github.com/repos/${currentRepo}/commits?per_page=30&page=${currentPage}`, { headers });
            const commits = await res.json();
            
            if (!Array.isArray(commits) || commits.length === 0) {
                if (btnLoadMore) btnLoadMore.innerText = "Fin de l'historique";
                return;
            }

            const list = document.getElementById('commitList');
            commits.forEach((c, i) => {
                const item = document.createElement('div');
                item.className = 'commit-item';
                item.innerHTML = `<b>${c.commit.message.substring(0, 40)}</b><br><span style="color:#666">${c.sha.substring(0, 7)} - ${new Date(c.commit.author.date).toLocaleDateString()}</span>`;
                
                item.onclick = () => {
                    document.querySelectorAll('.commit-item').forEach(d => d.style.background = "none");
                    item.style.background = "#f1f8ff";
                    loadTree(c.sha);
                };
                
                list.appendChild(item);
                if (currentPage === 1 && i === 0) item.click();
            });
            currentPage++;
        } catch (e) {
            console.error('❌ Erreur lors de la récupération des commits :', e);
        }
    }

    async function loadTree(sha) {
        const token = document.getElementById('tokenInput').value.trim();
        const headers = token ? { "Authorization": `token ${token}` } : {};
        
        try {
            const res = await fetch(`https://api.github.com/repos/${currentRepo}/git/trees/${sha}?recursive=1`, { headers });
            const data = await res.json();
            repoFullTree = data.tree || [];
            document.getElementById('snapshotSize').innerText = formatSize(repoFullTree.reduce((acc, i) => acc + (i.size || 0), 0));
            renderExplorer("");
        } catch (e) {
            console.error('❌ Erreur lors du chargement de l\'arbre :', e);
        }
    }

    function renderExplorer(path) {
        const table = document.getElementById('fileTable');
        table.innerHTML = "";

        const breadcrumbEl = document.getElementById('breadcrumb');
        const parts = path.split('/').filter(Boolean);
        
        let bcHtml = `<span class="breadcrumb-item" data-path="">root</span>`;
        parts.forEach((p, i) => {
            const targetPath = parts.slice(0, i + 1).join('/');
            bcHtml += ` / <span class="breadcrumb-item" data-path="${targetPath}">${p}</span>`;
        });
        breadcrumbEl.innerHTML = bcHtml;

        breadcrumbEl.querySelectorAll('.breadcrumb-item').forEach(el => {
            el.onclick = () => renderExplorer(el.getAttribute('data-path'));
        });

        const items = {};
        const total = repoFullTree.reduce((acc, i) => acc + (i.size || 0), 0);
        
        repoFullTree.forEach(item => {
            if (path === "" || item.path.startsWith(path + "/")) {
                const rel = path === "" ? item.path : item.path.substring(path.length + 1);
                const part = rel.split('/')[0];
                if (!items[part]) {
                    items[part] = { 
                        name: part, 
                        type: rel.includes('/') ? 'tree' : item.type, 
                        size: 0, 
                        path: path === "" ? part : path + "/" + part 
                    };
                }
                items[part].size += (item.size || 0);
            }
        });

        const sorted = Object.values(items).sort((a, b) => (b.type === 'tree') - (a.type === 'tree') || b.size - a.size);
        
        if (path !== "") {
            addRow("..", 0, 'tree', parts.slice(0, -1).join('/'), total, true);
        }
        
        sorted.forEach(item => addRow(item.name, item.size, item.type, item.path, total));
    }

    function addRow(name, size, type, path, total, isBack = false) {
        const tr = document.createElement('tr');
        tr.className = 'explorer-row';
        tr.onclick = () => type === 'tree' ? renderExplorer(path) : null;
        
        const pct = total > 0 ? ((size / total) * 100).toFixed(1) : 0;
        
        tr.innerHTML = `
            <td style="padding:10px;">${type === 'tree' ? '📁' : '📄'} ${name}</td>
            <td style="text-align:right; padding:10px; color:#666">${isBack ? '-' : formatSize(size)}</td>
            <td style="width:100px; padding:10px;">
                ${isBack ? '' : `<div style="height:4px; background:#eee;"><div style="background:#0366d6; width:${pct}%; height:100%;"></div></div>`}
            </td>
        `;
        
        document.getElementById('fileTable').appendChild(tr);
    }

    function showCleanSuggestions() {
        const sortedFiles = repoFullTree.filter(i => i.type === 'blob').sort((a, b) => b.size - a.size).slice(0, 5);
        document.getElementById('suggestionList').innerHTML = sortedFiles.map(f => `
            <div style="margin-bottom:10px; font-size:13px;">
                <b>${f.path}</b><br>
                <span style="color:#d73a49">${formatSize(f.size)}</span>
            </div>
        `).join('');
        document.getElementById('suggestionModal').style.display = 'block';
    }

    // Event Listeners
    if (btnScan) btnScan.addEventListener('click', () => initAnalysis(true));
    if (btnLoadMore) btnLoadMore.addEventListener('click', loadNextPage);
    if (btnAudit) btnAudit.addEventListener('click', showCleanSuggestions);
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            document.getElementById('suggestionModal').style.display = 'none';
        });
    }
});