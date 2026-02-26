---
layout: default
title: Analyseur de Mémoire GitHub
---

<div id="git-analyzer">
    <p>Entrez l'URL ou le nom du dépôt (ex: <code>facebook/react</code>) :</p>
    <input type="text" id="repoInput" placeholder="propriétaire/nom-du-repo" style="width: 300px; padding: 8px;">
    <button onclick="analyzeRepo()" style="padding: 8px 15px; cursor: pointer;">Analyser</button>

    <div id="results" style="margin-top: 30px; display: none;">
        <h3>Résultats pour <span id="displayName"></span></h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="background: #f4f4f4; text-align: left;">
                    <th style="padding: 10px; border: 1px solid #ddd;">Section</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Taille</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Usage</th>
                </tr>
            </thead>
            <tbody id="tableBody">
                </tbody>
        </table>

        <div id="storage-bar" style="width: 100%; background: #eee; height: 30px; border-radius: 15px; overflow: hidden; display: flex;">
            <div id="codeBar" style="background: #2ecc71; height: 100%; width: 0%; transition: width 1s;"></div>
            <div id="historyBar" style="background: #3498db; height: 100%; width: 0%; transition: width 1s;"></div>
        </div>
        <p><small>🟩 Code Actuel | 🟦 Historique & Objets Git</small></p>
    </div>

    <div id="loader" style="display: none; margin-top: 20px;">Analyse en cours...</div>
</div>

<script>
async function analyzeRepo() {
    const input = document.getElementById('repoInput').value.trim();
    const repoPath = input.replace('https://github.com/', '');
    if (!repoPath.includes('/')) return alert("Format invalide. Utilisez 'user/repo'");

    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader');
    
    loader.style.display = 'block';
    resultsDiv.style.display = 'none';

    try {
        // 1. Infos générales du Repo
        const repoRes = await fetch(`https://api.github.com/repos/${repoPath}`);
        const repoData = await repoRes.json();
        
        // 2. Calcul du code actuel (HEAD) via l'arbre
        const branchRes = await fetch(`https://api.github.com/repos/${repoPath}/branches/${repoData.default_branch}`);
        const branchData = await branchRes.json();
        const treeSha = branchData.commit.commit.tree.sha;
        
        const treeRes = await fetch(`https://api.github.com/repos/${repoPath}/git/trees/${treeSha}?recursive=1`);
        const treeData = await treeRes.json();
        
        let currentCodeSize = 0;
        treeData.tree.forEach(item => { if (item.size) currentCodeSize += item.size; });

        // Calculs (GitHub renvoie repoData.size en KB, et item.size en octets)
        const totalKB = repoData.size;
        const codeKB = currentCodeSize / 1024;
        const historyKB = Math.max(0, totalKB - codeKB);

        // Mise à jour de l'UI
        document.getElementById('displayName').innerText = repoPath;
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">Code source (Files)</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${(codeKB / 1024).toFixed(2)} MB</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${((codeKB/totalKB)*100).toFixed(1)}%</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">Historique Git (.git)</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${(historyKB / 1024).toFixed(2)} MB</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${((historyKB/totalKB)*100).toFixed(1)}%</td>
            </tr>
            <tr style="font-weight: bold;">
                <td style="padding: 10px; border: 1px solid #ddd;">TOTAL UTILISÉ</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${(totalKB / 1024).toFixed(2)} MB</td>
                <td style="padding: 10px; border: 1px solid #ddd;">100%</td>
            </tr>
        `;

        // Animation des barres
        document.getElementById('codeBar').style.width = (codeKB / totalKB * 100) + '%';
        document.getElementById('historyBar').style.width = (historyKB / totalKB * 100) + '%';
        
        resultsDiv.style.display = 'block';
    } catch (e) {
        alert("Erreur lors de la récupération des données. Vérifiez le nom du dépôt.");
    } finally {
        loader.style.display = 'none';
    }
}
</script>