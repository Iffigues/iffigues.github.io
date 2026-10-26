/* scripts/fetch-42-data.js */

const fs = require('fs');
const path = require('path');

const USER_LOGIN = process.env.FT_USER_LOGIN || 'bordenoy';
const TOKEN = process.env.FT_TOKEN;

// User-Agent personnalisé pour les requêtes API v2
const DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; GitHubActions-42DataFetcher/1.0)'
};

// Pause pour respecter le rate-limit de l'API 42 (2 requêtes/sec)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Tri récursif des clés et des tableaux pour garantir un JSON déterministe
function sortKeys(obj) {
    if (Array.isArray(obj)) {
        return obj
            .map(sortKeys)
            .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), undefined, { numeric: true, sensitivity: 'base' }));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj)
            .sort()
            .reduce((acc, key) => {
                acc[key] = sortKeys(obj[key]);
                return acc;
            }, {});
    }
    return obj;
}

function stripFetchedAt(value) {
    if (Array.isArray(value)) {
        return value.map(stripFetchedAt);
    }

    if (value !== null && typeof value === 'object') {
        return Object.keys(value).reduce((acc, key) => {
            if (key === 'fetched_at') return acc;
            acc[key] = stripFetchedAt(value[key]);
            return acc;
        }, {});
    }

    return value;
}

function stableStringify(value) {
    return `${JSON.stringify(sortKeys(value), null, 2).replace(/\r\n/g, '\n')}\n`;
}

// Support des endpoints utilisateur ET des URL complètes avec filtres
async function fetchAllPages(endpointOrUrl, token) {
    let results = [];
    let page = 1;
    const pageSize = 100;

    const isFullUrl = endpointOrUrl.startsWith('http');

    while (true) {
        let url;
        if (isFullUrl) {
            const separator = endpointOrUrl.includes('?') ? '&' : '?';
            url = `${endpointOrUrl}${separator}page[size]=${pageSize}&page[number]=${page}`;
        } else {
            url = `https://api.intra.42.fr/v2/users/${USER_LOGIN}/${endpointOrUrl}?page[size]=${pageSize}&page[number]=${page}`;
        }

        const response = await fetch(url, {
            headers: {
                ...DEFAULT_HEADERS,
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 429) {
            console.warn(`⚠️ Rate limit (429). Pause de 2s...`);
            await sleep(2000);
            continue;
        }

        if (!response.ok) {
            throw new Error(`Échec récupération (page ${page}) : ${response.statusText}`);
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) break;

        results = results.concat(data);

        if (data.length < pageSize) break;

        page++;
        await sleep(500);
    }

    return results;
}

// Interrogation individuelle /v2/projects/:id pour cibler description et project_sessions
async function fetchProjectDescriptions(projectIds, token) {
    const descriptionsMap = new Map();

    for (let i = 0; i < projectIds.length; i++) {
        const id = projectIds[i];
        const url = `https://api.intra.42.fr/v2/projects/${id}`;

        try {
            const response = await fetch(url, {
                headers: {
                    ...DEFAULT_HEADERS,
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 429) {
                console.warn(`⚠️ Rate limit (429) sur projet #${id}. Pause de 2s...`);
                await sleep(2000);
                i--; // Réessai du même projet
                continue;
            }

            if (response.ok) {
                const project = await response.json();
                const session = project.project_sessions?.[0];
                const sessionDesc = session?.description || session?.solo_description;
                const finalDesc = project.description || sessionDesc || project.summary || null;

                if (finalDesc && finalDesc.trim().length > 0) {
                    descriptionsMap.set(id, finalDesc.trim());
                }
            }
        } catch (e) {
            console.warn(`⚠️ Erreur réseau lors de la récupération du projet #${id} :`, e.message);
        }

        await sleep(350);
    }

    return descriptionsMap;
}

async function fetchUserProfile(token) {
    const response = await fetch(`https://api.intra.42.fr/v2/users/${USER_LOGIN}`, {
        headers: {
            ...DEFAULT_HEADERS,
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error(`Échec de récupération du profil : ${response.statusText}`);
    return await response.json();
}

// Téléchargement local des images d'achievements
async function processAchievements(userProfile, token) {
    if (!userProfile.achievements || !Array.isArray(userProfile.achievements)) return;

    const achievementsDir = path.join(process.cwd(), 'assets/images/42/achievements');
    fs.mkdirSync(achievementsDir, { recursive: true });

    console.log(`🏆 Téléchargement des images d'achievements (${userProfile.achievements.length})...`);

    for (const achievement of userProfile.achievements) {
        if (!achievement.image) continue;

        const imgPath = achievement.image;
        const filename = path.basename(imgPath);
        const localFilePath = path.join(achievementsDir, filename);
        const relativeJsonPath = `assets/images/42/achievements/${filename}`;

        const url = imgPath.startsWith('http') ? imgPath : `https://api.intra.42.fr${imgPath}`;

        try {
            const response = await fetch(url, {
                headers: {
                    ...DEFAULT_HEADERS,
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                const buffer = Buffer.from(await response.arrayBuffer());
                fs.writeFileSync(localFilePath, buffer);
                achievement.image = relativeJsonPath;
            } else {
                console.warn(`⚠️ Échec téléchargement image achievement ${filename}: ${response.statusText}`);
            }
        } catch (e) {
            console.warn(`⚠️ Erreur téléchargement image achievement ${filename}:`, e.message);
        }

        await sleep(100);
    }
}

async function main() {
    try {
        if (!TOKEN) {
            throw new Error('Variable d\'environnement FT_TOKEN manquante.');
        }

        console.log('🔑 Utilisation du token OAuth2 récupéré via GitHub Actions.');

        console.log(`📡 [1/7] Profil utilisateur (${USER_LOGIN})...`);
        const userProfile = await fetchUserProfile(TOKEN);

        // Téléchargement et mise à jour des chemins d'images des achievements
        await processAchievements(userProfile, TOKEN);

        console.log(`⏱️ [2/7] Historique logtime (locations)...`);
        const locations = await fetchAllPages('locations', TOKEN);

        console.log(`📝 [3/7] Évaluations (scale_teams)...`);
        const scaleTeams = await fetchAllPages('scale_teams', TOKEN);

        console.log(`📅 [4/7] Événements (events_users)...`);
        const eventsUsers = await fetchAllPages('events_users', TOKEN);

        console.log(`🛡️ [5/7] Coalitions...`);
        const coalitionsUsers = await fetchAllPages('coalitions_users', TOKEN);
        const coalitions = await fetchAllPages('coalitions', TOKEN);

        console.log(`🤝 [6/7] Partenariats (partnerships_users)...`);
        let partnerships = [];
        try {
            const partnershipsUrl = `https://api.intra.42.fr/v2/partnerships_users?filter[user_id]=${userProfile.id}`;
            partnerships = await fetchAllPages(partnershipsUrl, TOKEN);
        } catch (e) {
            console.warn(`⚠️ Impossible de récupérer les partenariats :`, e.message);
        }

        console.log(`🚀 [7/7] Projets & Récupération des descriptions (/v2/projects/:id)...`);
        const projectsUsers = await fetchAllPages('projects_users', TOKEN);

        const uniqueProjectIds = [...new Set(projectsUsers.map(p => p.project?.id).filter(Boolean))];
        console.log(`📖 Inspection de ${uniqueProjectIds.length} projets uniques sur l'API...`);
        
        const descriptionsMap = await fetchProjectDescriptions(uniqueProjectIds, TOKEN);

        const enrichedProjects = projectsUsers.map(p => {
            const pId = p.project?.id;
            const fetchedDesc = descriptionsMap.get(pId);
            
            const fallbackDesc = p.project?.slug 
                ? `Projet du cursus 42 (${p.project.slug}). Sujet officiel accessible sur l'Intra.`
                : 'Pas de description disponible pour ce projet.';

            return {
                ...p,
                project: {
                    ...p.project,
                    description: fetchedDesc || fallbackDesc
                }
            };
        });

        const fullData = sortKeys({
            fetched_at: new Date().toISOString(),
            user: userProfile,
            locations: locations,
            scale_teams: scaleTeams,
            events_users: eventsUsers,
            coalitions: coalitions,
            coalitions_users: coalitionsUsers,
            partnerships: partnerships,
            projects_users: enrichedProjects
        });

        const outputPath = path.join(process.cwd(), 'assets/data/42/user_data.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        if (fs.existsSync(outputPath)) {
            try {
                const existingRaw = fs.readFileSync(outputPath, 'utf8');
                const existingData = JSON.parse(existingRaw);

                const existingCompare = stableStringify(stripFetchedAt(existingData));
                const newCompare = stableStringify(stripFetchedAt(fullData));

                if (existingCompare === newCompare) {
                    console.log('ℹ️ Aucun changement dans les données. Fichier user_data.json conservé intact.');
                    return;
                }
            } catch (e) {
                // En cas d'erreur de lecture/parse, on continue et écrase le fichier.
            }
        }

        const jsonContent = stableStringify(fullData);
        fs.writeFileSync(outputPath, jsonContent, 'utf8');

        console.log(`✅ Nouvelles données enregistrées dans ${outputPath}`);
    } catch (error) {
        console.error('❌ Erreur :', error.message);
        process.exit(1);
    }
}

main();