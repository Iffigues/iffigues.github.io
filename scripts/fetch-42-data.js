/* scripts/fetch-42-data.js */

const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.FT_CLIENT_ID;
const CLIENT_SECRET = process.env.FT_CLIENT_SECRET;
const USER_LOGIN = process.env.FT_USER_LOGIN || 'bordenoy';

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

async function getAccessToken() {
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        })
    });

    if (!response.ok) {
        throw new Error(`Échec OAuth2 : ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
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
            headers: { Authorization: `Bearer ${token}` }
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
                headers: { Authorization: `Bearer ${token}` }
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
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(`Échec de récupération du profil : ${response.statusText}`);
    return await response.json();
}

async function main() {
    try {
        if (!CLIENT_ID || !CLIENT_SECRET) {
            throw new Error('Variables FT_CLIENT_ID ou FT_CLIENT_SECRET manquantes.');
        }

        console.log('🔑 Génération du token OAuth2...');
        const token = await getAccessToken();

        console.log(`📡 [1/7] Profil utilisateur (${USER_LOGIN})...`);
        const userProfile = await fetchUserProfile(token);

        console.log(`⏱️ [2/7] Historique logtime (locations)...`);
        const locations = await fetchAllPages('locations', token);

        console.log(`📝 [3/7] Évaluations (scale_teams)...`);
        const scaleTeams = await fetchAllPages('scale_teams', token);

        console.log(`📅 [4/7] Événements (events_users)...`);
        const eventsUsers = await fetchAllPages('events_users', token);

        console.log(`🛡️ [5/7] Coalitions...`);
        const coalitionsUsers = await fetchAllPages('coalitions_users', token);
        const coalitions = await fetchAllPages('coalitions', token);

        console.log(`🤝 [6/7] Partenariats (partnerships_users)...`);
        let partnerships = [];
        try {
            const partnershipsUrl = `https://api.intra.42.fr/v2/partnerships_users?filter[user_id]=${userProfile.id}`;
            partnerships = await fetchAllPages(partnershipsUrl, token);
        } catch (e) {
            console.warn(`⚠️ Impossible de récupérer les partenariats :`, e.message);
        }

        console.log(`🚀 [7/7] Projets & Récupération des descriptions (/v2/projects/:id)...`);
        const projectsUsers = await fetchAllPages('projects_users', token);

        const uniqueProjectIds = [...new Set(projectsUsers.map(p => p.project?.id).filter(Boolean))];
        console.log(`📖 Inspection de ${uniqueProjectIds.length} projets uniques sur l'API...`);
        
        const descriptionsMap = await fetchProjectDescriptions(uniqueProjectIds, token);

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