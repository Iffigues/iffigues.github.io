---
layout: default
title: Git Disk Analyzer Pro
---

<div id="git-app" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1000px; margin: auto; color: #24292e; background: #fff;">
    
    <div style="background: #24292e; padding: 20px; border-radius: 8px 8px 0 0; color: white; display: flex; gap: 10px; align-items: center;">
        <div style="flex: 2;">
            <label style="font-size: 10px; text-transform: uppercase; color: #8b949e; display: block; margin-bottom: 4px;">Dépôt GitHub</label>
            <input type="text" id="repoInput" placeholder="propriétaire/nom-du-repo" style="width: 100%; padding: 10px; border-radius: 4px; border: none; background: #3f4448; color: white;">
        </div>
        <div style="flex: 1;">
            <label style="font-size: 10px; text-transform: uppercase; color: #8b949e; display: block; margin-bottom: 4px;">Token (Optionnel)</label>
            <input type="password" id="tokenInput" placeholder="ghp_xxxx" style="width: 100%; padding: 10px; border-radius: 4px; border: none; background: #3f4448; color: white;">
        </div>
        <button onclick="initAnalysis()" style="margin-top: 15px; background: #2ea44f; color: white; border: none; padding: 11px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">Scanner</button>
    </div>

    <div id="disk-section" style="display: none; padding: 20px; border: 1px solid #e1e4e8; border-top: none; background: #f6f8fa;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 15px;">
            <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #ddd;">
                <div style="font-size: 10px; color: #666;">TAILLE TOTALE (Quota)</div>
                <div style="font-size: 1.2em; font-weight: bold;">5.00 GB</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #ddd;">
                <div style="font-size: 10px; color: #666;">UTILISÉ (Repo .git)</div>
                <div id="diskUsed" style="font-size: 1.2em; font-weight: bold; color: #d73a49;">-</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #ddd;">
                <div style="font-size: 10px; color: #666;">DISPONIBLE</div>
                <div id="diskAvail" style="font-size: 1.2em; font-weight: bold; color: #2ea44f;">-</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #ddd;">
                <div style="font-size: 10px; color: #666;">INSTANTANÉ (HEAD)</div>
                <div id="snapshotSize" style="font-size: 1.2em; font-weight: bold;">-</div>
            </div>
        </div>
        <div style="width: 100%; height: 10px; background: #eee; border-radius: 5px; overflow: hidden; display: flex;">
            <div id="barUsed" style="background: #d73a49; width: 0%;"></div>
            <div id="barFree" style="background: #2ea44f; width: 100%;"></div>
        </div>
    </div>

    <div id="main-view" style="display: none; display: grid; grid-template-columns: 280px 1fr; gap: 0; border: 1px solid #e1e4e8; border-top: none;">
        
        <div style="border-right: 1px solid #e1e4e8; background: #fff;">
            <div style="padding: 10px; background: #fafbfc; border-bottom: 1px solid #e1e4e8; font-size: 11px; font-weight: bold; color: #586069;">HISTORIQUE DES COMMITS</div>
            <div id="commitList" style="max-height: 500px; overflow-y: auto;"></div>
        </div>

        <div style="background: #fff; min-height: 500px;">
            <div id="explorerHeader" style="padding: 12px; border-bottom: 1px solid #e1e4e8;">
                <div id="breadcrumb" style="font-family: monospace; font-size: 13px; color: #0366d6;"></div>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <tbody id="fileTable"></tbody>
            </table>
        </div>
    </div>
</div>

<script>
let repoFullTree = [];
let repoMeta = {};
const GITHUB_LIMIT = 5 * 1024 * 1024 * 1024; // 5GB en octets

async function initAnalysis() {
    const repo = document.getElementById('repoInput').value.trim();
    const token = document.getElementById('tokenInput').value.trim();
    const headers = token ? { "Authorization": `token ${token}` } : {};

    try {
        // 1. Meta pour la taille disque réelle (.git)
        const rRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
        repoMeta = await rRes.json();
        
        // MAJ Disk Stats (df style)
        const usedBytes = repoMeta.size * 1024;
        const availBytes = GITHUB_LIMIT - usedBytes;
        document.getElementById('diskUsed').innerText = formatSize(usedBytes);
        document.getElementById('diskAvail').innerText = formatSize(availBytes);
        document.getElementById('barUsed').style.width = (usedBytes / GITHUB_LIMIT * 100) + "%";
        document.getElementById('disk-section').style.display = 'block';

        // 2. Commits
        const cRes = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=12`, { headers });
        const commits = await cRes.json();
        renderCommits(commits);

        document.getElementById('main-view').style.display = 'grid';
    } catch (e) { alert("Erreur d'accès au dépôt."); }
}

function renderCommits(commits) {
    const list = document.getElementById('commitList');
    list.innerHTML = "";
    commits.forEach((c, i) => {
        const item = document.createElement('div');
        item.style.cssText = "padding: 12px; border-bottom: 1px solid #f1f1f1; cursor: pointer; font-size: 12px; transition: 0.2s;";
        item.innerHTML = `
            <div style="font-weight: 600; color: #24292e;">${c.commit.message.substring(0, 40)}...</div>
            <div style="color: #6a737d; margin-top: 4px;">${c.sha.substring(0,7)} • ${new Date(c.commit.author.date).toLocaleDateString()}</div>
        `;
        item.onclick = () => {
            document.querySelectorAll('#commitList div').forEach(d => d.style.background = "none");
            item.style.background = "#f1f8ff";
            loadTreeAtCommit(c.sha);
        };
        list.appendChild(item);
        if(i === 0) item.click();
    });
}

async function loadTreeAtCommit(sha) {
    const repo = document.getElementById('repoInput').value.trim();
    const token = document.getElementById('tokenInput').value.trim();
    const headers = token ? { "Authorization": `token ${token}` } : {};

    const res = await fetch(`https://api.github.com/repos/${repo}/git/trees/${sha}?recursive=1`, { headers });
    const data = await res.json();
    repoFullTree = data.tree;
    
    const snapshotSize = repoFullTree.reduce((acc, i) => acc + (i.size || 0), 0);
    document.getElementById('snapshotSize').innerText = formatSize(snapshotSize);
    
    renderExplorer("");
}

function renderExplorer(path) {
    const table = document.getElementById('fileTable');
    const bread = document.getElementById('breadcrumb');
    table.innerHTML = "";

    bread.innerHTML = `<span onclick="renderExplorer('')" style="cursor:pointer">root</span>` + 
        path.split('/').filter(x=>x).map((p, i, arr) => {
            const fp = arr.slice(0, i+1).join('/');
            return ` / <span onclick="renderExplorer('${fp}')" style="cursor:pointer">${p}</span>`;
        }).join('');

    const items = {};
    const totalInSnapshot = repoFullTree.reduce((acc, i) => acc + (i.size || 0), 0);

    repoFullTree.forEach(item => {
        if (path === "" || item.path.startsWith(path + "/")) {
            const rel = path === "" ? item.path : item.path.substring(path.length + 1);
            const part = rel.split('/')[0];
            if (!items[part]) {
                items[part] = { name: part, type: rel.includes('/') ? 'tree' : item.type, size: 0, fullPath: path===""?part:path+"/"+part };
            }
            items[part].size += (item.size || 0);
        }
    });

    const sorted = Object.values(items).sort((a,b) => (b.type==='tree')-(a.type==='tree') || b.size - a.size);

    if (path !== "") {
        const parent = path.includes('/') ? path.split('/').slice(0,-1).join('/') : "";
        addFileRow("..", 0, 'tree', parent, totalInSnapshot, true);
    }
    sorted.forEach(item => addFileRow(item.name, item.size, item.type, item.fullPath, totalInSnapshot));
}

function addFileRow(name, size, type, fPath, total, isBack) {
    const tr = document.createElement('tr');
    tr.style.cssText = "border-bottom: 1px solid #f6f8fa; cursor: pointer; font-size: 13px;";
    tr.onclick = () => type === 'tree' ? renderExplorer(fPath) : null;
    tr.onmouseover = () => tr.style.background = "#fbfcfe";
    tr.onmouseout = () => tr.style.background = "none";

    const pct = ((size / total) * 100).toFixed(1);

    tr.innerHTML = `
        <td style="padding: 10px; width: 60%;">${type==='tree'?'📁':'📄'} ${name}</td>
        <td style="padding: 10px; color: #666; width: 20%; text-align: right;">${isBack?'-':formatSize(size)}</td>
        <td style="padding: 10px; width: 20%;">
            ${!isBack ? `
                <div style="height:4px; background:#eee; border-radius:2px; width:100%; position:relative;">
                    <div style="height:100%; background:#0366d6; width:${pct}%"></div>
                </div>
            ` : ''}
        </td>
    `;
    document.getElementById('fileTable').appendChild(tr);
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
}
</script>