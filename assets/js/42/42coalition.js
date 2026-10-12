document.addEventListener("DOMContentLoaded", () => {
    // Adapter le chemin vers user_data.json
    const jsonPath = '/assets/data/42/user_data.json';

    fetch(jsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.coalitions) {
                renderCoalitionPage(data.coalitions);
            } else {
                showError("La clé 'coalitions' n'a pas été trouvée dans le JSON.");
            }
        })
        .catch(error => {
            console.error("Erreur de chargement des données coalition :", error);
            showError(`Impossible de charger les données : ${error.message}`);
        });
});

function renderCoalitionPage(coalitions) {
    const container = document.getElementById('coalitions-grid');
    
    if (!container) {
        console.error("L'élément #coalitions-grid est introuvable dans le DOM.");
        return;
    }

    if (!Array.isArray(coalitions) || coalitions.length === 0) {
        container.innerHTML = '<p class="empty-msg">Aucune coalition enregistrée.</p>';
        return;
    }

    // Efface le message "Chargement des coalitions..."
    container.innerHTML = '';

    // Trouver le score maximum pour déterminer la coalition active
    const maxScore = Math.max(...coalitions.map(c => c.score || 0));

    coalitions.forEach(coalition => {
        const isActive = coalition.score > 0 && coalition.score === maxScore;
        const mainColor = coalition.color || '#3e4451';
        const formattedScore = (coalition.score || 0).toLocaleString('fr-FR');

        const card = document.createElement('div');
        card.className = `coalition-card ${isActive ? 'active-coalition' : 'inactive-coalition'}`;
        card.style.borderColor = mainColor;

        card.innerHTML = `
            <div class="coalition-banner" style="background-image: url('${coalition.cover_url || ''}')">
                <div class="coalition-overlay"></div>
                <div class="coalition-header">
                    <img src="${coalition.image_url || ''}" alt="Logo ${coalition.name || ''}" class="coalition-icon" />
                    <div class="coalition-titles">
                        <span class="coalition-subtitle">${coalition.slug || ''}</span>
                        <h2 style="color: ${mainColor}">${coalition.name || 'Coalition'}</h2>
                    </div>
                </div>
                ${isActive ? '<span class="status-badge active-badge">Active</span>' : '<span class="status-badge inactive-badge">Inactive</span>'}
            </div>

            <div class="coalition-body">
                <div class="stat-box">
                    <span class="stat-label">Score d'utilisateur</span>
                    <span class="stat-value">${formattedScore} pts</span>
                </div>

                <div class="stat-box">
                    <span class="stat-label">Identifiants</span>
                    <div class="stat-details">
                        <span><strong>ID :</strong> ${coalition.id || '-'}</span>
                        <span><strong>User ID :</strong> ${coalition.user_id || '-'}</span>
                    </div>
                </div>

                <div class="stat-box">
                    <span class="stat-label">Couleur Officielle</span>
                    <div class="color-display">
                        <span class="color-box" style="background-color: ${mainColor}"></span>
                        <span class="color-code">${mainColor}</span>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function showError(message) {
    const container = document.getElementById('coalitions-grid');
    if (container) {
        container.innerHTML = `<p class="error-msg" style="color: #e06c75; text-align: center; padding: 40px;">⚠️ ${message}</p>`;
    }
}