/* assets/js/42profile.js */

document.addEventListener('DOMContentLoaded', async () => {
    const jsonPath = (window.siteBaseUrl || '') + '/assets/data/42/user_data.json';
    const CDN_42_URL = 'https://cdn.intra.42.fr';

    console.log('🚀 initialisation de 42profile.js');
    console.log('📍 Chemin du fichier JSON cible :', jsonPath);

    const escapeHtml = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    function getBadgeImageUrl(imagePath) {
        if (!imagePath) return '';

        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath.replace('https://cdn.intra.42.fr/uploads/', 'https://cdn.intra.42.fr/');
        }

        let cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
        if (cleanPath.startsWith('/uploads/')) {
            cleanPath = cleanPath.replace('/uploads/', '/');
        }

        return `${CDN_42_URL}${cleanPath}`;
    }

    try {
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Données brutes reçues du JSON :', data);

        const user = data.user || (Array.isArray(data) ? {} : data);
        console.log('👤 Objet User résolu :', user);

        // 1. Informations de Profil
        const avatarEl = document.getElementById('user-avatar');
        if (avatarEl) {
            const avatarUrl = user.image?.versions?.medium || user.image?.link;
            if (avatarUrl) {
                avatarEl.src = avatarUrl;
                console.log('🖼️ Avatar chargé :', avatarUrl);
            }
        }

        if (user.login) {
            const loginEl = document.getElementById('user-login');
            if (loginEl) {
                loginEl.textContent = user.login;
                console.log('🏷️ Login chargé :', user.login);
            }
        }

        // Titres
        const titlesEl = document.getElementById('user-titles');
        if (titlesEl) {
            const rawTitles = user.titles || user.titles_users || data.titles || [];
            console.log('👑 Titres bruts :', rawTitles);
            if (Array.isArray(rawTitles) && rawTitles.length > 0) {
                const formattedTitles = rawTitles
                    .map(t => {
                        const titleObj = t.title || t;
                        const name = typeof titleObj === 'string' ? titleObj : titleObj?.name;
                        if (!name) return '';
                        return name
                            .replace(/%login,\s*/gi, '')
                            .replace(/,\s*%login/gi, '')
                            .replace(/%login/gi, '')
                            .trim();
                    })
                    .filter(Boolean)
                    .join(', ');

                titlesEl.textContent = formattedTitles || 'Aucun titre';
            } else {
                titlesEl.textContent = 'Aucun titre';
            }
        }

        const evalEl = document.getElementById('user-eval-points');
        if (evalEl && user.correction_point !== undefined) {
            evalEl.textContent = user.correction_point;
            console.log('🎯 Points de correction :', user.correction_point);
        }

        const walletEl = document.getElementById('user-wallet');
        if (walletEl && user.wallet !== undefined) {
            walletEl.textContent = user.wallet;
            console.log('💰 Wallet :', user.wallet);
        }

        // Cursus principal (42cursus)
        const mainCursus = user.cursus_users?.find(c => c.cursus?.slug === '42cursus') || user.cursus_users?.[0];
        console.log('🎓 Cursus principal retenu :', mainCursus);

        const levelEl = document.getElementById('user-level');
        if (levelEl && mainCursus) {
            levelEl.textContent = `Lvl ${mainCursus.level.toFixed(2)}`;
            console.log('📈 Niveau 42 :', mainCursus.level);
        }

        const locEl = document.getElementById('user-location');
        if (locEl) {
            locEl.textContent = user.location || 'Hors campus';
            console.log('📍 Location :', user.location || 'Hors campus');
        }

        // 2. Badges / Achievements
        const badgesContainer = document.getElementById('badges-container');
        if (badgesContainer) {
            if (user.achievements && user.achievements.length > 0) {
                console.log(`🏅 ${user.achievements.length} badges trouvés`);
                badgesContainer.innerHTML = user.achievements.map(ach => {
                    const imgUrl = getBadgeImageUrl(ach.image);
                    return `
                        <div class="badge-item" title="${escapeHtml(ach.description || '')}">
                            <img src="${imgUrl}" 
                                 alt="${escapeHtml(ach.name)}" 
                                 onerror="this.style.display='none';">
                            <span>${escapeHtml(ach.name)}</span>
                        </div>
                    `;
                }).join('');
            } else {
                console.warn('⚠️ Aucun badge trouvé dans user.achievements');
                badgesContainer.innerHTML = '<p>Aucun badge trouvé.</p>';
            }
        }

        // 3. Projets Validés
        const projectsContainer = document.getElementById('projects-container');
        if (projectsContainer) {
            if (user.projects_users && user.projects_users.length > 0) {
                const validatedProjects = user.projects_users
                    .filter(p => p['validated?'] === true)
                    .sort((a, b) => new Date(b.marked_at) - new Date(a.marked_at));

                console.log(`📁 ${validatedProjects.length} projets validés sur ${user.projects_users.length} au total`);
                const baseUrl = window.siteBaseUrl || '';

                if (validatedProjects.length > 0) {
                    projectsContainer.innerHTML = validatedProjects.map(p => `
                        <a href="${baseUrl}/42project-detail?id=${p.project.id}" class="project-card-link" style="text-decoration: none; color: inherit;">
                            <div class="project-card">
                                <div class="project-card-header">
                                    <span class="project-card-title">${escapeHtml(p.project.name)}</span>
                                    <span class="project-badge-mark">${p.final_mark}/100</span>
                                </div>
                                <small>Validé le : ${new Date(p.marked_at).toLocaleDateString('fr-FR')}</small>
                            </div>
                        </a>
                    `).join('');
                } else {
                    projectsContainer.innerHTML = '<p>Aucun projet validé trouvé.</p>';
                }
            } else {
                console.warn('⚠️ Aucun projet trouvé dans user.projects_users');
                projectsContainer.innerHTML = '<p>Aucun projet trouvé.</p>';
            }
        }

        // 4. Top Compétences
        const skillsContainer = document.getElementById('skills-container');
        if (skillsContainer) {
            const skills = mainCursus?.skills || [];
            console.log(`💡 ${skills.length} compétences chargées`);

            if (skills.length > 0) {
                const sortedSkills = [...skills].sort((a, b) => b.level - a.level);

                skillsContainer.innerHTML = sortedSkills.map(s => {
                    const percentage = Math.min((s.level / 21) * 100, 100);
                    return `
                        <div class="skill-item" style="margin-bottom: 12px;">
                            <div class="skill-info" style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span class="skill-name"><strong>${escapeHtml(s.name)}</strong></span>
                                <span class="skill-level">Lvl ${s.level.toFixed(2)}</span>
                            </div>
                            <div class="skill-bar-bg" style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden;">
                                <div class="skill-bar-fill" style="width: ${percentage}%; background: #00babc; height: 100%;"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                skillsContainer.innerHTML = '<p>Aucune compétence enregistrée.</p>';
            }
        }

        // 5. Partenariats
        const partnershipsContainer = document.getElementById('partnerships-container') 
            || document.getElementById('project-partnership') 
            || document.getElementById('partnerships');

        if (partnershipsContainer) {
            const partnerships = user.partnerships || data.partnerships || [];
            console.log(`🤝 ${partnerships.length} partenariats trouvés`);

            if (Array.isArray(partnerships) && partnerships.length > 0) {
                partnershipsContainer.innerHTML = partnerships.map(p => `
                    <div class="partnership-item" style="margin-bottom: 8px;">
                        🤝 <strong>${escapeHtml(p.name)}</strong>
                    </div>
                `).join('');
            } else {
                partnershipsContainer.innerHTML = '<p>Aucun partenariat trouvé.</p>';
            }
        }

        // 6. Événements
        const eventsContainer = document.getElementById('events-container');
        console.log('🔍 Recherche du conteneur d\'événements (#events-container) :', eventsContainer);

        if (eventsContainer) {
            const rawEvents = user.events_users 
                || data.events_users 
                || user.events 
                || data.events 
                || (Array.isArray(data) ? data : []);

            console.log('📅 Données brutes des événements récupérées :', rawEvents);

            if (Array.isArray(rawEvents) && rawEvents.length > 0) {
                const sortedEvents = [...rawEvents].sort((a, b) => {
                    const dateA = new Date(a.event?.begin_at || a.begin_at || 0);
                    const dateB = new Date(b.event?.begin_at || b.begin_at || 0);
                    return dateB - dateA;
                });

                console.log(`📅 ${sortedEvents.length} événements à afficher (triés par date)`);

                eventsContainer.innerHTML = sortedEvents.map((item, index) => {
                    const evt = item.event || item;
                    const startDate = evt.begin_at ? new Date(evt.begin_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : 'Date inconnue';

                    return `
                        <div class="event-card" data-event-index="${index}" style="cursor: pointer; margin-bottom: 10px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
                            <div class="event-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <strong class="event-title">${escapeHtml(evt.name || 'Événement')}</strong>
                                ${evt.kind ? `<span class="event-kind" style="background: #00babc; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase;">${escapeHtml(evt.kind)}</span>` : ''}
                            </div>
                            <small style="color: #aaa;">📍 ${escapeHtml(evt.location || 'N/C')} | 📅 ${startDate}</small>
                        </div>
                    `;
                }).join('');

                // Modal
                const eventModal = document.getElementById('event-modal');
                const eventModalBody = document.getElementById('event-modal-body');
                const eventModalClose = document.querySelector('.event-modal-close');

                console.log('📌 Éléments modal événements :', { eventModal, eventModalBody, eventModalClose });

                if (eventModal && eventModalBody) {
                    eventsContainer.querySelectorAll('.event-card').forEach(card => {
                        card.addEventListener('click', () => {
                            const idx = card.getAttribute('data-event-index');
                            const item = sortedEvents[idx];
                            const evt = item.event || item;

                            console.log('👆 Clic sur événement :', evt.name);

                            const startDate = evt.begin_at ? new Date(evt.begin_at).toLocaleString('fr-FR') : 'Non précisée';
                            const endDate = evt.end_at ? new Date(evt.end_at).toLocaleString('fr-FR') : 'Non précisée';

                            // Nettoyage et conversion des liens HTTP/HTTPS
                            let formattedDesc = escapeHtml(evt.description || 'Pas de description disponible.').replace(/\n/g, '<br>');
                            formattedDesc = formattedDesc.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #00babc; text-decoration: underline;">$1</a>');

                            eventModalBody.innerHTML = `
                                <h3 style="margin-top:0; color:#00babc;">${escapeHtml(evt.name)}</h3>
                                <p><strong>Type :</strong> ${escapeHtml(evt.kind || 'N/C')}</p>
                                <p><strong>Lieu :</strong> ${escapeHtml(evt.location || 'N/C')}</p>
                                <p><strong>Début :</strong> ${startDate}</p>
                                <p><strong>Fin :</strong> ${endDate}</p>
                                ${evt.max_people ? `<p><strong>Inscrits :</strong> ${evt.nbr_subscribers || 0} / ${evt.max_people}</p>` : ''}
                                <hr style="margin: 10px 0; border: 0; border-top: 1px solid rgba(255,255,255,0.1);">
                                <div style="line-height: 1.5; max-height: 250px; overflow-y: auto;">${formattedDesc}</div>
                            `;
                            eventModal.style.display = 'flex';
                        });
                    });

                    if (eventModalClose) {
                        eventModalClose.addEventListener('click', () => {
                            eventModal.style.display = 'none';
                        });
                    }

                    window.addEventListener('click', (e) => {
                        if (e.target === eventModal) {
                            eventModal.style.display = 'none';
                        }
                    });
                } else {
                    console.warn('⚠️ Modal d\'événements non trouvé dans le DOM (#event-modal ou #event-modal-body manquant)');
                }
            } else {
                console.warn('⚠️ Aucun événement trouvé dans les données');
                eventsContainer.innerHTML = '<p>Aucun événement trouvé.</p>';
            }
        } else {
            console.error('❌ ÉLÉMENT MANQUANT : Le div #events-container n\'existe pas dans le HTML.');
        }

        // 7. Liens Campus & Réseaux Sociaux
        const campusSocialContainer = document.getElementById('campus-social-container') 
            || document.getElementById('campus-links');

        if (campusSocialContainer) {
            const campusList = user.campus || data.campus || [];
            const primaryCampus = campusList.find(c => c.active) || campusList[0];

            if (primaryCampus) {
                const links = [];
                if (primaryCampus.website) links.push(`<a href="${escapeHtml(primaryCampus.website)}" target="_blank" rel="noopener noreferrer">🌐 Site Web</a>`);
                if (primaryCampus.facebook) links.push(`<a href="${escapeHtml(primaryCampus.facebook)}" target="_blank" rel="noopener noreferrer">📘 Facebook</a>`);
                if (primaryCampus.twitter) links.push(`<a href="${escapeHtml(primaryCampus.twitter)}" target="_blank" rel="noopener noreferrer">🐦 Twitter</a>`);

                campusSocialContainer.innerHTML = links.length > 0 
                    ? links.map(l => `<div style="margin-bottom: 5px;">${l}</div>`).join('')
                    : '<p>Aucun lien campus disponible.</p>';
            }
        }

        console.log('✅ Traitement du profil terminé avec succès.');

    } catch (err) {
        console.error('❌ ERREUR lors de l\'exécution de 42profile.js :', err);
    }
});