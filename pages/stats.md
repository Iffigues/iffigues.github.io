---
layout: default
title: Git Memory Deep Analyzer
---

<div id="git-expert-dashboard" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: auto; background: #fff; color: #1b1f23;">
    
    <div style="background: #24292e; padding: 25px; border-radius: 8px 8px 0 0; color: white;">
        <h2 style="margin: 0 0 15px 0; font-weight: 400;">Analyseur de Structure Git</h2>
        <div style="display: flex; gap: 10px;">
            <input type="text" id="repoInput" placeholder="propriétaire/nom-du-repo" style="flex-grow: 1; padding: 12px; border-radius: 6px; border: none; font-size: 15px;">
            <button onclick="deepAnalyze()" style="background: #2ea44f; color: white; border: none; padding: 12px 25px; border-radius: 6px; cursor: pointer; font-weight: bold;">Lancer l'audit</button>
        </div>
    </div>

    <div id="loader" style="display: none; padding: 50px; text-align: center;">
        <div class="spinner"></div>
        <p>Extraction des données binaires et scan de l'historique...</p>
    </div>

    <div id="dashboardContent" style="display: none; border: 1px solid #e1e4e8; border-top: none; padding: 20px;">
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
            <div style="padding: 15px; background: #f6f8fa; border-radius: 6px; border: 1px solid #e1e4e8; text-align: center;">
                <div style="font-size: 0.85em; color: #586069;">COMMITS TOTAL</div>
                <div id="statCommits" style="font-size: 1.8em; font-weight: bold;">-</div>
            </div>
            <div style="padding: 15px; background: #f6f8fa; border-radius: 6px; border: 1px solid #e1e4e8; text-align: center;">
                <div style="font-size: 0.85em; color: #586069;">POIDS DES FICHIERS</div>
                <div id="statCode" style="font-size: 1.8em; font-weight: bold;">-</div>
            </div>
            <div style="padding: 15px; background: #f6f8fa; border-radius: 6px; border: 1px solid #e1e4e8; text-align: center;">
                <div style="font-size: 0.85em; color: #586069;">POIDS DU .GIT</div>
                <div id="statGit" style="font-size: 1.8em; font-weight: bold;">-</div>
            </div>
        </div>

        <div style="margin-bottom: 30px;">
            <h4 style="margin-bottom: 10px;">Répartition de la mémoire vive vs historique</h4>
            <div style="width: 100%; height: 35px; background: #eee; border-radius: 18px; display: flex; overflow: hidden; border: 1px solid #ddd;">
                <div id="barCode" style="background: #2ecc71; height: 100%; transition: width 1s;" title="Code actuel"></div>
                <div id="barHistory" style="background: #3498db; height: 100%; transition: width 1s;" title="Objets Git & Historique"></div>
            </div>
            <p style="font-size: 0.8em; color: #666; margin-top: 8px;">
                <span style="color: #2ecc71;">●</span> Fichiers HEAD | <span style="color: #3498db;">●</span> Historique, Commits & Objets compressés
            </p>
        </div>

        <div style="border: 1px solid #e1e4e8; border-radius: 6px;">
            <div id="breadcrumb" style="padding: 10px; background: #f6f8fa; border-bottom: 1px solid #e1e4e8; font-family: monospace;"></div>
            <div style="max-height: 400px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody id="fileList"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<style>
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #2ea44f; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    tr:hover { background: #f9f9f9; }
</style>

<script>
let fullTree = [];
let repoData = {};
let totalCodeSize = 0;

async function deepAnalyze() {
    const repo = document.getElementById('repoInput').value.trim();
    const loader = document.getElementById('loader');
    const content = document.getElementById('dashboardContent');
    
    loader.style.display = 'block';
    content.style.display = 'none';

    try {
        // 1. Infos de base & Quota
        const rRes = await fetch(`https://api.github.com/repos/${repo}`);
        repoData = await rRes.json();
        
        // 2. Récupérer le nombre de commits (approximation via l'API stats)
        // Note: L'API contributors est souvent plus rapide pour le décompte total
        const commitRes = await fetch(`https://api.github.com/repos/${repo}/stats/contributors`);
        const commitData = await commitRes.json();
        let totalCommits = 0;
        commitData.forEach(contributor => totalCommits += contributor.total);

        // 3. Arbre complet
        const tRes = await fetch(`https://api.github.com/repos/${repo}/git/trees/${repoData.default_branch}?recursive=1`);
        const tData = await tRes.json();
        fullTree = tData.tree;

        // Calculs de taille
        totalCodeSize = fullTree.reduce((acc, i) => acc + (i.size || 0), 0);
        const totalGitSizeKB = repoData.size; // Taille totale incluant .git
        const historySizeKB = totalGitSizeKB - (totalCodeSize / 1024);

        // Update Stats
        document.getElementById('statCommits').innerText = totalCommits.toLocaleString();
        document.getElementById('statCode').innerText = formatSize(totalCodeSize);
        document.getElementById('statGit').innerText = formatSize(totalGitSizeKB * 1024);

        // Update Bars
        const codeRatio = ( (totalCodeSize / 1024) / totalGitSizeKB ) * 100;
        document.getElementById('barCode').style.width = codeRatio + "%";
        document.getElementById('barHistory').style.width = (100 - codeRatio) + "%";

        renderPath("");
        
        loader.style.display = 'none';
        content.style.display = 'block';

    } catch (e) {
        alert("Erreur d'analyse. Vérifiez le nom du dépôt ou le quota d'API.");
        loader.style.display = 'none';
    }
}

function renderPath(path) {
    const list = document.getElementById('fileList');
    const bread = document.getElementById('breadcrumb');
    list.innerHTML = "";
    
    bread.innerHTML = `<span style="color:#0366d6;cursor:pointer" onclick="renderPath('')">root</span>` + 
        path.split('/').filter(x=>x).map((p,i,arr) => {
            const fp = arr.slice(0,i+1).join('/');
            return ` / <span style="color:#0366d6;cursor:pointer" onclick="renderPath('${fp}')">${p}</span>`;
        }).join('');

    const levelItems = {};
    fullTree.forEach(item => {
        if (path === "" || item.path.startsWith(path + "/")) {
            const rel = path === "" ? item.path : item.path.substring(path.length+1);
            const name = rel.split('/')[0];
            if (!levelItems[name]) {
                levelItems[name] = { name, type: rel.includes('/')?'tree':item.type, size: 0, path: path===""?name:path+"/"+name };
            }
            levelItems[name].size += (item.size || 0);
        }
    });

    const sorted = Object.values(levelItems).sort((a,b) => (b.type==='tree')-(a.type==='tree') || b.size - a.size);

    if (path !== "") {
        const parent = path.includes('/') ? path.split('/').slice(0,-1).join('/') : "";
        addEntry("..", 0, 'tree', parent, true);
    }

    sorted.forEach(item => addEntry(item.name, item.size, item.type, item.path));
}

function addEntry(name, size, type, path, isBack) {
    const row = document.createElement('tr');
    row.style.cursor = "pointer";
    row.onclick = () => type === 'tree' ? renderPath(path) : null;
    
    const pct = ((size / totalCodeSize) * 100).toFixed(1);
    
    row.innerHTML = `
        <td style="padding:10px; border-bottom:1px solid #eee;">${type==='tree'?'📁':'📄'} ${name}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; font-size:0.9em; color:#666;">${isBack?'-':formatSize(size)}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; width:80px;">
            <span style="font-size:0.7em; background:#e1f5fe; padding:2px 5px; border-radius:4px;">${isBack?'':pct+'%'}</span>
        </td>
    `;
    document.getElementById('fileList').appendChild(row);
}

function formatSize(b) {
    if (b === 0) return '0 B';
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return (b / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB'][i];
}
</script>