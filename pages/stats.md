---
layout: default
title: Git Evolution Tracker
---

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<div id="git-evolution-dashboard" style="font-family: sans-serif; max-width: 900px; margin: auto; border: 1px solid #e1e4e8; border-radius: 8px; overflow: hidden;">
    
    <div style="background: #f6f8fa; padding: 20px; border-bottom: 1px solid #e1e4e8;">
        <div style="display: flex; gap: 10px;">
            <input type="text" id="repoInput" placeholder="ex: facebook/react" style="flex-grow: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
            <button onclick="analyzeEvolution()" style="background: #0366d6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Tracer l'évolution</button>
        </div>
    </div>

    <div id="loader" style="display: none; padding: 30px; text-align: center;">📊 Analyse des instantanés historiques...</div>

    <div id="results" style="display: none; padding: 20px;">
        <h4>Évolution de la taille du code (Derniers Commits)</h4>
        <canvas id="sizeChart" style="width: 100%; height: 300px; margin-bottom: 30px;"></canvas>

        <h4>Détails des Variations</h4>
        <div id="commitHistory" style="font-size: 0.9em;"></div>
    </div>
</div>

<script>
let myChart = null;

async function analyzeEvolution() {
    const repo = document.getElementById('repoInput').value.trim();
    const loader = document.getElementById('loader');
    const results = document.getElementById('results');
    
    loader.style.display = 'block';
    results.style.display = 'none';

    try {
        // 1. Récupérer les 10 derniers commits
        const commitsRes = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=10`);
        const commits = await commitsRes.json();
        
        const historyData = [];

        // 2. Pour chaque commit, on récupère la taille du "Tree"
        // On utilise Promise.all pour paralléliser les requêtes
        for (let commit of commits.reverse()) {
            const treeSha = commit.commit.tree.sha;
            const treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees/${treeSha}?recursive=1`);
            const treeData = await treeRes.json();
            
            const totalSize = treeData.tree.reduce((acc, item) => acc + (item.size || 0), 0);
            
            historyData.push({
                date: new Date(commit.commit.author.date).toLocaleDateString(),
                sizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                msg: commit.commit.message.substring(0, 30) + "..."
            });
        }

        renderChart(historyData);
        renderCommitList(historyData);

        loader.style.display = 'none';
        results.style.display = 'block';
    } catch (e) {
        alert("Erreur d'accès aux données historiques.");
        loader.style.display = 'none';
    }
}

function renderChart(data) {
    const ctx = document.getElementById('sizeChart').getContext('2d');
    
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: 'Taille du dépôt (MB)',
                data: data.map(d => d.sizeMB),
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false, title: { display: true, text: 'MegaBytes' } } }
        }
    });
}

function renderCommitList(data) {
    const container = document.getElementById('commitHistory');
    container.innerHTML = data.reverse().map(c => `
        <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
            <span><strong>${c.date}</strong> - ${c.msg}</span>
            <span style="color: #0366d6; font-weight: bold;">${c.sizeMB} MB</span>
        </div>
    `).join('');
}
</script>