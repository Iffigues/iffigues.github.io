---
layout: default
title: Git Time-Travel Explorer
---

<div id="git-time-machine" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1000px; margin: auto; color: #24292e;">
    
    <div style="background: #24292e; padding: 20px; border-radius: 8px; color: white; display: flex; gap: 10px; flex-wrap: wrap;">
        <input type="text" id="repoInput" placeholder="propriétaire/nom-du-repo" style="flex: 2; padding: 10px; border-radius: 4px; border: none;">
        <input type="password" id="tokenInput" placeholder="Token GitHub (Optionnel)" style="flex: 1; padding: 10px; border-radius: 4px; border: none; background: #3f4448; color: white;">
        <button onclick="loadCommits()" style="background: #2ea44f; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">Charger l'Historique</button>
    </div>

    <div id="main-layout" style="display: grid; grid-template-columns: 300px 1fr; gap: 20px; margin-top: 20px; display: none;">
        
        <div style="border: 1px solid #e1e4e8; border-radius: 6px; background: #f6f8fa;">
            <div style="padding: 10px; border-bottom: 1px solid #e1e4e8; font-weight: bold; font-size: 0.9em;">Derniers Commits</div>
            <div id="commitList" style="max-height: 600px; overflow-y: auto;"></div>
        </div>

        <div style="border: 1px solid #e1e4e8; border-radius: 6px; background: white; display: flex; flex-direction: column;">
            <div id="explorerHeader" style="padding: 15px; border-bottom: 1px solid #e1e4e8; background: #fff;">
                <div id="currentCommitInfo" style="margin-bottom: 10px; font-size: 0.85em; color: #586069;"></div>
                <div id="breadcrumb" style="font-family: monospace; font-size: 0.9em; color: #0366d6;"></div>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="background: #fafbfc; border-bottom: 1px solid #e1e4e8; font-size: 0.8em; color: #586069;">
                    <tr>
                        <th style="padding: 10px; text-align: left;">Nom</th>
                        <th style="padding: 10px; text-align: left; width: 100px;">Taille</th>
                        <th style="padding: 10px; text-align: left; width: 80px;">Part</th>
                    </tr>
                </thead>
                <tbody id="fileTable"></tbody>
            </table>
        </div>
    </div>
</div>

<script>
let allFiles = [];
let currentRepo = "";
let totalSizeAtCommit = 0;

// 1. Charger la liste des commits
async function loadCommits() {
    const repo = document.getElementById('repoInput').value.trim();
    const token = document.getElementById('tokenInput').value.trim();
    const headers = token ? { "Authorization": `token ${token}` } : {};

    try {
        const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=15`, { headers });
        const commits = await res.json();
        currentRepo = repo;

        const list = document.getElementById('commitList');
        list.innerHTML = "";
        commits.forEach((c, index) => {
            const div = document.createElement('div');
            div.style.cssText = "padding: 12px; border-bottom: 1px solid #e1e4e8; cursor: pointer; font-size: 0.85em;";
            div.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 4px;">${c.commit.message.substring(0, 50)}</div>
                <div style="color: #666; font-size: 0.8em;">${new Date(c.commit.author.date).toLocaleDateString()} • ${c.sha.substring(0,7)}</div>
            `;
            div.onclick = () => {
                document.querySelectorAll('#commitList div').forEach(d => d.style.background = "transparent");
                div.style.background = "#fff";
                loadTree(c.sha, c.commit.message);
            };
            list.appendChild(div);
            if(index === 0) div.click(); // Charger le plus récent par défaut
        });

        document.getElementById('main-layout').style.display = 'grid';
    } catch (e) { alert("Erreur lors du chargement des commits."); }
}

// 2. Charger l'arborescence d'un commit spécifique
async function loadTree(sha, message) {
    const token = document.getElementById('tokenInput').value.trim();
    const headers = token ? { "Authorization": `token ${token}` } : {};
    
    document.getElementById('currentCommitInfo').innerText = `📅 Snapshot : "${message}" (${sha.substring(0,7)})`;
    document.getElementById('fileTable').innerHTML = "<tr><td colspan='3' style='padding:20px; text-align:center;'>Chargement des fichiers...</td></tr>";

    try {
        const res = await fetch(`https://api.github.com/repos/${currentRepo}/git/trees/${sha}?recursive=1`, { headers });
        const data = await res.json();
        allFiles = data.tree;
        totalSizeAtCommit = allFiles.reduce((acc, i) => acc + (i.size || 0), 0);
        renderFolder("");
    } catch (e) { alert("Erreur d'arborescence."); }
}

// 3. Afficher un dossier spécifique
function renderFolder(path) {
    const table = document.getElementById('fileTable');
    const bread = document.getElementById('breadcrumb');
    table.innerHTML = "";

    // Breadcrumb
    bread.innerHTML = `<span onclick="renderFolder('')" style="cursor:pointer">root</span>` + 
        path.split('/').filter(x=>x).map((p, i, arr) => {
            const fp = arr.slice(0, i+1).join('/');
            return ` / <span onclick="renderFolder('${fp}')" style="cursor:pointer">${p}</span>`;
        }).join('');

    const items = {};
    allFiles.forEach(item => {
        if (path === "" || item.path.startsWith(path + "/")) {
            const rel = path === "" ? item.path : item.path.substring(path.length + 1);
            const name = rel.split('/')[0];
            if (!items[name]) {
                items[name] = { name, type: rel.includes('/') ? 'tree' : item.type, size: 0, path: path===""?name:path+"/"+name };
            }
            items[name].size += (item.size || 0);
        }
    });

    const sorted = Object.values(items).sort((a,b) => (b.type==='tree')-(a.type==='tree') || b.size - a.size);

    if(path !== "") {
        const parent = path.includes('/') ? path.split('/').slice(0,-1).join('/') : "";
        addRow("..", 0, 'tree', parent, true);
    }

    sorted.forEach(item => addRow(item.name, item.size, item.type, item.path));
}

function addRow(name, size, type, path, isBack) {
    const row = document.createElement('tr');
    row.style.cssText = "border-bottom: 1px solid #f1f1f1; cursor: pointer;";
    row.onclick = () => type === 'tree' ? renderFolder(path) : null;
    
    const pct = ((size / totalSizeAtCommit) * 100).toFixed(1);

    row.innerHTML = `
        <td style="padding: 10px; color: ${type==='tree'?'#0366d6':'#24292e'}">${type==='tree'?'📁':'📄'} ${name}</td>
        <td style="padding: 10px; color: #666; font-size: 0.9em;">${isBack?'-':formatSize(size)}</td>
        <td style="padding: 10px;">
            <div style="font-size: 0.7em; color: #999;">${isBack?'':pct+'%'}</div>
            <div style="height:3px; background:#eee; border-radius:2px;">
                <div style="height:100%; background:#0366d6; width:${isBack?0:pct}%"></div>
            </div>
        </td>
    `;
    document.getElementById('fileTable').appendChild(row);
}

function formatSize(b) {
    if (b === 0) return '0 B';
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return (b / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
}
</script>