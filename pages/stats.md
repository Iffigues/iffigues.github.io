---
layout: default
title: Analyseur de Mémoire GitHub
---

<div id="git-analyzer" style="font-family: sans-serif; max-width: 600px; margin: auto;">
    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <input type="text" id="repoInput" placeholder="ex: facebook/react" style="flex-grow: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
        <button onclick="analyzeRepo()" style="background: #24292e; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Analyser</button>
    </div>

    <div id="loader" style="display: none; text-align: center;">⚙️ Calcul des octets en cours...</div>

    <div id="results" style="display: none; border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: #fafafa;">
        <h3 style="margin-top: 0;">Dépôt : <span id="displayName" style="color: #0366d6;"></span></h3>
        
        <p><strong>Utilisation du quota GitHub (Limite conseillée : 5 GB)</strong></p>
        <div style="width: 100%; background: #e1e4e8; height: 25px; border-radius: 5px; margin-bottom: 10px; display: flex; overflow: hidden; border: 1px solid #d1d5da;">
            <div id="usedBar" style="background: #d73a49; width: 0%; transition: width 0.8s;"></div>
        </div>
        <p id="statsText" style="font-size: 0.9em; color: #586069;"></p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

        <table style="width: 100%; font-size: 0.9em; text-align: left; border-collapse: collapse;">
            <thead>
                <tr style="color: #586069; border-bottom: 2px solid #eaecef;">
                    <th style="padding: 8px;">Source</th>
                    <th>Taille</th>
                    <th>Utilisé %</th>
                </tr>
            </thead>
            <tbody id="tableBody"></tbody>
        </table>
    </div>
</div>

<script>
async function analyzeRepo() {
    const input = document.getElementById('repoInput').value.trim();
    const repoPath = input.replace('https://github.com/', '');
    if (!repoPath.includes('/')) return alert("Format : utilisateur/nom-repo");

    const GITHUB_LIMIT_KB = 5 * 1024 * 1024; // 5 GB en KB
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader');
    
    loader.style.display = 'block';
    resultsDiv.style.display = 'none';

    try {
        const repoRes = await fetch(`https://api.github.com/repos/${repoPath}`);
        const repoData = await repoRes.json();
        
        const totalUsedKB = repoData.size; // Taille totale du dossier .git sur le serveur
        const remainingKB = GITHUB_LIMIT_KB - totalUsedKB;
        const percentTotal = ((totalUsedKB / GITHUB_LIMIT_KB) * 100).toFixed(2);

        // Mise à jour graphique
        document.getElementById('displayName').innerText = repoPath;
        document.getElementById('usedBar').style.width = percentTotal + '%';
        document.getElementById('statsText').innerHTML = `
            <b>Utilisé :</b> ${(totalUsedKB / 1024).toFixed(2)} MB / 5120.00 MB 
            (<span style="color: #d73a49;">${percentTotal}%</span>)
        `;

        // Détails du tableau
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = `
            <tr>
                <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">Dépôt (Git Objects)</td>
                <td style="border-bottom: 1px solid #eee;">${(totalUsedKB / 1024).toFixed(2)} MB</td>
                <td style="border-bottom: 1px solid #eee;">${percentTotal}%</td>
            </tr>
            <tr>
                <td style="padding: 10px 8px; border-bottom: 1px solid #eee; color: #6a737d;">Espace libre (Quota)</td>
                <td style="border-bottom: 1px solid #eee; color: #6a737d;">${(remainingKB / 1024).toFixed(2)} MB</td>
                <td style="border-bottom: 1px solid #eee; color: #6a737d;">${(100 - percentTotal).toFixed(2)}%</td>
            </tr>
        `;

        resultsDiv.style.display = 'block';
    } catch (e) {
        alert("Erreur. Vérifiez si le dépôt est public.");
    } finally {
        loader.style.display = 'none';
    }
}
</script>