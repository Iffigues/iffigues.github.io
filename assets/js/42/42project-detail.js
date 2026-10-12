/* assets/js/42project-detail.js */

document.addEventListener('DOMContentLoaded', async () => {
    console.group('🔍 Debug: Initialisation de 42project-detail.js');
    
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdRaw = urlParams.get('id');
    const evalsContainer = document.getElementById('project-evaluations');

    if (!projectIdRaw) {
        if (evalsContainer) evalsContainer.innerHTML = "<p>❌ ID de projet manquant dans l'URL.</p>";
        console.groupEnd();
        return;
    }

    const projectId = parseInt(projectIdRaw, 10);
    const jsonPath = `${window.siteBaseUrl || ''}/assets/data/42/user_data.json`;

    const escapeHtml = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const rawData = await response.json();
        const user = rawData.user || rawData;

        // 1. Extraire les collections
        const projectsList = rawData.projects_users || user.projects_users || [];
        const allScaleTeams = rawData.scale_teams || user.scale_teams || [];
        const currentUserId = user.id;

        // 2. Filtrer toutes les occurrences du projet
        const matchingProjects = projectsList.filter(p => {
            const pId = p.project?.id || p.project_id;
            return pId && parseInt(pId, 10) === projectId;
        });

        if (matchingProjects.length === 0) {
            if (evalsContainer) evalsContainer.innerHTML = "<p>Projet introuvable dans le profil.</p>";
            console.groupEnd();
            return;
        }

        // Sélection de la meilleure tentative (validée en priorité, ou avec la note max)
        let bestOccurrence = matchingProjects[0];
        matchingProjects.forEach(p => {
            const isVal = p['validated?'] === true || p.validated === true;
            const bestIsVal = bestOccurrence['validated?'] === true || bestOccurrence.validated === true;
            
            if (isVal && !bestIsVal) {
                bestOccurrence = p;
            } else if ((p.final_mark ?? 0) >= (bestOccurrence.final_mark ?? 0)) {
                bestOccurrence = p;
            }
        });

        // Nom et description
        let projectName = bestOccurrence.project?.name || '';
        let projectDesc = bestOccurrence.project?.description || '';

        for (const p of matchingProjects) {
            if (!projectName && p.project?.name) {
                projectName = p.project.name.trim();
            }
            if (!projectDesc && p.project?.description && p.project.description.trim() !== '') {
                projectDesc = p.project.description.trim();
            }
        }

        const projectStatus = bestOccurrence.status || 'finished';
        const projectFinalMark = bestOccurrence.final_mark ?? 0;
        const isValidated = bestOccurrence['validated?'] === true || bestOccurrence.validated === true;

        // Mise à jour du titre
        const titleEl = document.getElementById('project-title');
        if (titleEl) {
            titleEl.innerHTML = `<span class="glitch">42</span> : ${escapeHtml(projectName || `Projet #${projectId}`)}`;
        }

        // --- AFFICHAGE DU STATUT ET DE LA NOTE DANS LE BLOC "INFORMATIONS DU PROJET" ---
        const metaContainer = document.getElementById('project-meta-info');
        if (metaContainer) {
            const statusClass = isValidated ? 'status-success' : 'status-fail';
            const statusLabel = isValidated ? 'Validé' : escapeHtml(projectStatus);

            metaContainer.innerHTML = `
                <p><strong>Statut :</strong> <span class="${statusClass}">${statusLabel}</span></p>
                <p><strong>Note finale :</strong> <strong class="mark-highlight">${projectFinalMark}/100</strong></p>
            `;
        }

        // --- DESCRIPTION ---
        const descCard = document.getElementById('project-description-card');
        const descText = document.getElementById('project-description-text');
        
        if (projectDesc && projectDesc.trim() !== '' && descCard && descText) {
            descText.style.whiteSpace = 'pre-wrap';
            descText.textContent = projectDesc.trim();
            descCard.style.display = 'block';
        } else if (descCard) {
            descCard.style.display = 'none';
        }

        // 3. Récupération des IDs d'équipes pour les évaluations
        const teamIds = new Set();
        matchingProjects.forEach(p => {
            if (p.current_team_id) teamIds.add(p.current_team_id);
            if (Array.isArray(p.teams)) {
                p.teams.forEach(t => { if (t && t.id) teamIds.add(t.id); });
            }
        });

        // 4. Filtrage des scale_teams
        const projectScales = allScaleTeams.filter(scale => {
            if (!scale) return false;
            const scaleTeamId = scale.team_id || scale.team?.id;
            if (scaleTeamId && teamIds.has(scaleTeamId)) return true;
            const scaleProjId = scale.team?.project_id || scale.project_id || scale.project?.id;
            if (scaleProjId && parseInt(scaleProjId, 10) === projectId) return true;
            const scaleProjName = (scale.team?.project_name || scale.project?.name || '').toLowerCase();
            return projectName && scaleProjName === projectName.toLowerCase();
        });

        // 5. Tri des évaluations (reçues vs données)
        const evalsReceived = [];
        const evalsGiven = [];

        projectScales.forEach(scale => {
            const isCorrector = scale.corrector?.id === currentUserId || scale.is_corrector === true;
            if (isCorrector) {
                evalsGiven.push(scale);
            } else {
                evalsReceived.push(scale);
            }
        });

        // 6. Rendu HTML des commentaires
        let htmlContent = '';

        if (evalsReceived.length > 0) {
            htmlContent += `<h3>📥 Corrections reçues</h3>`;
            htmlContent += evalsReceived.map(ev => {
                const mark = ev.final_mark ?? ev.team?.final_mark ?? 'N/A';
                return `
                    <div class="evaluation-item">
                        <div class="eval-meta">
                            <strong>👨‍💻 Corrigé par :</strong> ${escapeHtml(ev.corrector?.login || 'Correcteur')} | 
                            <strong>Note :</strong> ${mark}/100 | 
                            <strong>Date :</strong> ${ev.created_at ? new Date(ev.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                        <div class="eval-comment">"${escapeHtml(ev.comment || ev.feedback || 'Aucun commentaire.')}"</div>
                    </div>
                `;
            }).join('');
        }

        if (evalsGiven.length > 0) {
            htmlContent += `<h3 style="margin-top:20px;">📤 Corrections effectuées</h3>`;
            htmlContent += evalsGiven.map(ev => {
                const mark = ev.final_mark ?? ev.team?.final_mark ?? 'N/A';
                return `
                    <div class="evaluation-item">
                        <div class="eval-meta">
                            <strong>👤 Équipe corrigée :</strong> ${escapeHtml(ev.team?.name || 'Équipe')} | 
                            <strong>Note donnée :</strong> ${mark}/100 | 
                            <strong>Date :</strong> ${ev.created_at ? new Date(ev.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                        <div class="eval-comment">"${escapeHtml(ev.comment || ev.feedback || 'Aucun commentaire.')}"</div>
                    </div>
                `;
            }).join('');
        }

        if (evalsReceived.length === 0 && evalsGiven.length === 0) {
            htmlContent = `<p class="no-evals">Aucun commentaire de correction enregistré pour <strong>${escapeHtml(projectName || `Projet #${projectId}`)}</strong>.</p>`;
        }

        if (evalsContainer) evalsContainer.innerHTML = htmlContent;

    } catch (err) {
        console.error('❌ Erreur lors de l\'exécution:', err);
        if (evalsContainer) evalsContainer.innerHTML = `<p class="error-msg">Erreur lors de la récupération des données.</p>`;
    } finally {
        console.groupEnd();
    }
});