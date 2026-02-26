---
layout: default
title: Analyseur de Mémoire GitHub
---

<div id="analyzer-container" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: auto;">
    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <input type="text" id="repoInput" placeholder="propriétaire/dépôt" style="flex-grow: 1; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
        <button onclick="startAnalysis()" style="background: #2ea44f; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold;">Analyser</button>
    </div>

    <div id="status" style="margin-bottom: 20px; color: #666;"></div>

    <div id="explorer-v2" style="display: none; border: 1px solid #e1e4e8; border-radius: 6px; background: white;">
        <div id="breadcrumb" style="padding: 10px; background: #f6f8fa; border-bottom: 1px solid #e1e4e8; font-size: 0.9em;"></div>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; background: #fafbfc; border-bottom: 1px solid #e1e4e8;">
                    <th style="padding: 12px;">Nom</th>
                    <th style="padding: 12px; width: 120px;">Taille</th>
                    <th style="padding: 12px; width: 100px;">Ratio</th>
                </tr>
            </thead>
            <tbody id="fileList"></tbody>
        </table>
    </div>
</div>

<script>
let fullTree = [];
let currentPath = "";
let repoTotalSize = 0;

async function startAnalysis() {
    const repo = document.getElementById('repoInput').value.trim();
    const status = document.getElementById('status');
    if(!repo.includes('/')) return alert("Format requis: owner/repo");

    status.innerText = "⏳ Récupération de l'arborescence...";
    document.getElementById('explorer-v2').style.display = 'none';

    try {
        // 1. Obtenir la branche par défaut
        const rRes = await fetch(`https://api.github.com/repos/${repo}`);
        const rData = await rRes.json();
        
        // 2. Obtenir l'arbre complet récursivement
        const tRes = await fetch(`https://api.github.com/repos/${repo}/git/trees/${rData.default_branch}?recursive=1`);
        const tData = await tRes.json();
        
        fullTree = tData.tree;
        repoTotalSize = fullTree.reduce((acc, item) => acc + (item.size || 0), 0);
        
        currentPath = "";
        renderPath("");
        document.getElementById('explorer-v2').style.display = 'block';
        status.innerText = `✅ Analyse terminée. Taille totale du code : ${formatSize(repoTotalSize)}`;
    } catch (e) {
        status.innerText = "❌ Erreur (Dépôt privé ou limite d'API atteinte)";
    }
}

function renderPath(path) {
    currentPath = path;
    const list = document.getElementById('fileList');
    const breadcrumb = document.getElementById('breadcrumb');
    list.innerHTML = "";

    // Gérer le fil d'Ariane
    breadcrumb.innerHTML = `<span style="color:#0366d6; cursor:pointer" onclick="renderPath('')">root</span> / ` + 
        path.split('/').filter(x => x).map((p, i, arr) => {
            const fullP = arr.slice(0, i+1).join('/');
            return `<span style="color:#0366d6; cursor:pointer" onclick="renderPath('${fullP}')">${p}</span>`;
        }).join(' / ');

    // Filtrer les éléments du dossier actuel
    const items = getItemsInPath(path);

    // Trier : Dossiers d'abord, puis par taille
    items.sort((a, b) => (b.type === 'tree') - (a.type === 'tree') || b.computedSize - a.computedSize);

    if (path !== "") {
        const parent = path.includes('/') ? path.split('/').slice(0, -1).join('/') : "";
        addRow("..", 0, 'tree', parent, true);
    }

    items.forEach(item => {
        const name = item.path.split('/').pop();
        addRow(name, item.computedSize, item.type, item.path);
    });
}

function getItemsInPath(path) {
    const level = path === "" ? 0 : path.split('/').length;
    const folderContents = {};

    fullTree.forEach(item => {
        if (path === "" || item.path.startsWith(path + "/")) {
            const relativePath = path === "" ? item.path : item.path.substring(path.length + 1);
            const parts = relativePath.split('/');
            const name = parts[0];

            if (!folderContents[name]) {
                folderContents[name] = { path: path === "" ? name : path + "/" + name, type: parts.length > 1 ? 'tree' : item.type, computedSize: 0 };
            }
            folderContents[name].computedSize += (item.size || 0);
        }
    });

    return Object.values(folderContents);
}

function addRow(name, size, type, path, isBack = false) {
    const tbody = document.getElementById('fileList');
    const row = document.createElement('tr');
    row.style.borderBottom = "1px solid #f1f1f1";
    row.style.cursor = "pointer";
    row.onclick = () => type === 'tree' ? renderPath(path) : null;
    
    const icon = type === 'tree' ? "📁" : "📄";
    const percent = ((size / repoTotalSize) * 100).toFixed(1);

    row.innerHTML = `
        <td style="padding: 10px;">${icon} ${name}</td>
        <td style="padding: 10px; color: #586069;">${isBack ? '-' : formatSize(size)}</td>
        <td style="padding: 10px;">
            ${isBack ? '' : `<div style="background:#e1e4e8; height:8px; border-radius:4px;"><div style="background:#0366d6; width:${percent}%; height:100%; border-radius:4px;"></div></div>`}
        </td>
    `;
    tbody.appendChild(row);
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
</script>