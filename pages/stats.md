---
layout: 
title: Git Disk Analyzer Pro - Full History
---

<div id="git-app" style="font-family: system-ui, sans-serif; max-width: 1100px; margin: auto; border: 1px solid #e1e4e8; border-radius: 8px; overflow: hidden; background: white;">
    
    <div style="background: #24292e; padding: 20px; color: white; display: flex; gap: 10px; flex-wrap: wrap;">
        <input type="text" id="repoInput" placeholder="user/repo" style="flex: 2; padding: 10px; border-radius: 4px; border: none;">
        <input type="password" id="tokenInput" placeholder="Token (Optionnel)" style="flex: 1; padding: 10px; border-radius: 4px; border: none; background: #3f4448; color: white;">
        <button onclick="initAnalysis(true)" style="background: #2ea44f; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">Scanner</button>
    </div>

    <div id="disk-section" style="display: none; padding: 20px; background: #f6f8fa; border-bottom: 1px solid #e1e4e8;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 15px;">
            <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #ddd;">
                <div style="font-size: 10px; color: #666;">TOTAL QUOTA</div>
                <div style="font-size: 1.2em; font-weight: bold;">5.00 GB</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #ddd;">
                <div style="font-size: 10px; color: #666;">USED (.GIT)</div>
                <div id="diskUsed" style="font-size: 1.2em; font-weight: bold; color: #d73a49;">-</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #ddd;">
                <div style="font-size: 10px; color: #666;">AVAILABLE</div>
                <div id="diskAvail" style="font-size: 1.2em; font-weight: bold; color: #2ea44f;">-</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #ddd;">
                <div style="font-size: 10px; color: #666;">SNAPSHOT</div>
                <div id="snapshotSize" style="font-size: 1.2em; font-weight: bold;">-</div>
            </div>
        </div>
        <div style="width: 100%; height: 10px; background: #eee; border-radius: 5px; overflow: hidden; display: flex;">
            <div id="barUsed" style="background: #d73a49; width: 0%;"></div>
        </div>
    </div>

    <div id="main-view" style="display: none; grid-template-columns: 320px 1fr; border-top: 1px solid #e1e4e8;">
        <div style="border-right: 1px solid #e1e4e8; background: #fff; display: flex; flex-direction: column;">
            <div style="padding: 10px; background: #fafbfc; border-bottom: 1px solid #e1e4e8; font-weight: bold; font-size: 12px;">COMMITS</div>
            <div id="commitList" style="flex-grow: 1; overflow-y: auto; max-height: 500px;"></div>
            <button id="loadMoreBtn" onclick="loadNextPage()" style="width: 100%; padding: 10px; background: #f6f8fa; border: none; border-top: 1px solid #e1e4e8; cursor: pointer; font-size: 12px; color: #0366d6;">Charger plus de commits...</button>
        </div>

        <div style="display: flex; flex-direction: column;">
            <div style="padding: 12px; border-bottom: 1px solid #e1e4e8; background: #fff; display: flex; justify-content: space-between;">
                <div id="breadcrumb" style="font-family: monospace; color: #0366d6;"></div>
                <button onclick="showCleanSuggestions()" style="font-size: 11px; background: #fff; border: 1px solid #d1d5da; border-radius: 4px; cursor: pointer; padding: 2px 8px;">🔍 Audit Fichiers Lourds</button>
            </div>
            <div style="overflow-y: auto; max-height: 550px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody id="fileTable"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div id="suggestionModal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:white; padding:30px; border-radius:8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index:100; border:1px solid #ddd;">
    <h3 style="margin-top:0">Fichiers à optimiser</h3>
    <div id="suggestionList"></div>
    <button onclick="document.getElementById('suggestionModal').style.display='none'" style="margin-top:20px; padding:8px 15px; cursor:pointer;">Fermer</button>
</div>

<script>
let currentPage = 1;
let currentRepo = "";
let repoFullTree = [];
const GITHUB_LIMIT = 5 * 1024 * 1024 * 1024;

async function initAnalysis(reset = true) {
    if(reset) { currentPage = 1; document.getElementById('commitList').innerHTML = ""; }
    const repo = document.getElementById('repoInput').value.trim();
    const token = document.getElementById('tokenInput').value.trim();
    const headers = token ? { "Authorization": `token ${token}` } : {};

    try {
        const rRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
        const meta = await rRes.json();
        currentRepo = repo;

        const usedBytes = meta.size * 1024;
        document.getElementById('diskUsed').innerText = formatSize(usedBytes);
        document.getElementById('diskAvail').innerText = formatSize(GITHUB_LIMIT - usedBytes);
        document.getElementById('barUsed').style.width = (usedBytes / GITHUB_LIMIT * 100) + "%";
        document.getElementById('disk-section').style.display = 'block';
        document.getElementById('main-view').style.display = 'grid';

        loadNextPage();
    } catch (e) { alert("Erreur de connexion."); }
}

async function loadNextPage() {
    const token = document.getElementById('tokenInput').value.trim();
    const headers = token ? { "Authorization": `token ${token}` } : {};
    
    const res = await fetch(`https://api.github.com/repos/${currentRepo}/commits?per_page=30&page=${currentPage}`, { headers });
    const commits = await res.json();
    
    if(commits.length === 0) return document.getElementById('loadMoreBtn').innerText = "Fin de l'historique";

    const list = document.getElementById('commitList');
    commits.forEach((c, i) => {
        const item = document.createElement('div');
        item.style.cssText = "padding: 10px; border-bottom: 1px solid #f1f1f1; cursor: pointer; font-size: 11px;";
        item.innerHTML = `<b>${c.commit.message.substring(0,40)}</b><br><span style="color:#666">${c.sha.substring(0,7)} - ${new Date(c.commit.author.date).toLocaleDateString()}</span>`;
        item.onclick = () => {
            document.querySelectorAll('#commitList div').forEach(d => d.style.background = "none");
            item.style.background = "#f1f8ff";
            loadTree(c.sha);
        };
        list.appendChild(item);
        if(currentPage === 1 && i === 0) item.click();
    });
    currentPage++;
}

async function loadTree(sha) {
    const token = document.getElementById('tokenInput').value.trim();
    const headers = token ? { "Authorization": `token ${token}` } : {};
    const res = await fetch(`https://api.github.com/repos/${currentRepo}/git/trees/${sha}?recursive=1`, { headers });
    const data = await res.json();
    repoFullTree = data.tree;
    document.getElementById('snapshotSize').innerText = formatSize(repoFullTree.reduce((acc, i) => acc + (i.size || 0), 0));
    renderExplorer("");
}

function renderExplorer(path) {
    const table = document.getElementById('fileTable');
    table.innerHTML = "";
    document.getElementById('breadcrumb').innerHTML = `<span onclick="renderExplorer('')" style="cursor:pointer">root</span>` + 
        path.split('/').filter(x=>x).map((p, i, arr) => ` / <span onclick="renderExplorer('${arr.slice(0,i+1).join('/')}')" style="cursor:pointer">${p}</span>`).join('');

    const items = {};
    const total = repoFullTree.reduce((acc, i) => acc + (i.size || 0), 0);
    repoFullTree.forEach(item => {
        if (path === "" || item.path.startsWith(path + "/")) {
            const rel = path === "" ? item.path : item.path.substring(path.length + 1);
            const part = rel.split('/')[0];
            if (!items[part]) items[part] = { name: part, type: rel.includes('/') ? 'tree' : item.type, size: 0, path: path===""?part:path+"/"+part };
            items[part].size += (item.size || 0);
        }
    });

    const sorted = Object.values(items).sort((a,b) => (b.type==='tree')-(a.type==='tree') || b.size - a.size);
    if(path !== "") addRow("..", 0, 'tree', path.split('/').slice(0,-1).join('/'), total, true);
    sorted.forEach(item => addRow(item.name, item.size, item.type, item.path, total));
}

function addRow(name, size, type, path, total, isBack) {
    const tr = document.createElement('tr');
    tr.style.cssText = "border-bottom: 1px solid #f9f9f9; cursor: pointer; font-size: 13px;";
    tr.onclick = () => type === 'tree' ? renderExplorer(path) : null;
    const pct = ((size / total) * 100).toFixed(1);
    tr.innerHTML = `<td style="padding:10px;">${type==='tree'?'📁':'📄'} ${name}</td><td style="text-align:right; padding:10px; color:#666">${isBack?'-':formatSize(size)}</td><td style="width:100px; padding:10px;">${isBack?'':`<div style="height:4px; background:#eee;"><div style="background:#0366d6; width:${pct}%; height:100%;"></div></div>`}</td>`;
    document.getElementById('fileTable').appendChild(tr);
}

function showCleanSuggestions() {
    const sortedFiles = repoFullTree.filter(i => i.type === 'blob').sort((a,b) => b.size - a.size).slice(0, 5);
    document.getElementById('suggestionList').innerHTML = sortedFiles.map(f => `<div style="margin-bottom:10px; font-size:13px;"><b>${f.path}</b><br><span style="color:#d73a49">${formatSize(f.size)}</span></div>`).join('');
    document.getElementById('suggestionModal').style.display = 'block';
}

function formatSize(b) {
    if (!b) return '0 B';
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return (b / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
}
</script>