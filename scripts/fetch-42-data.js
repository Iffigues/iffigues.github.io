/* scripts/fetch-42-data.js */

const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.FT_CLIENT_ID;
const CLIENT_SECRET = process.env.FT_CLIENT_SECRET;
const USER_LOGIN = process.env.FT_USER_LOGIN || 'bordenoy';

// Pause pour respecter le rate-limit de l'API 42 (2 requêtes/sec)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Tri récursif des clés d'un objet pour garantir un JSON déterministe
function sortKeys(obj) {
    if (Array.isArray(obj)) {
        return obj.map(sortKeys);
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

async function fetchAllPages(endpoint, token) {
    let results = [];
    let page = 1;
    const pageSize = 100;

    while (true) {
        const url = `https://api.intra.42.fr/v2/users/${USER_LOGIN}/${endpoint}?page[size]=${pageSize}&page[number]=${page}`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 429) {
            console.warn(`⚠️ Rate limit (429) sur ${endpoint}. Pause de 2s...`);
            await sleep(2000);
            continue;
        }

        if (!response.ok) {
            throw new Error(`Échec récupération ${endpoint} (page ${page}) : ${response.statusText}`);
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

        console.log(`📡 [1/6] Profil utilisateur (${USER_LOGIN})...`);
        const userProfile = await fetchUserProfile(token);

        console.log(`⏱️ [2/6] Historique logtime (locations)...`);
        const locations = await fetchAllPages('locations', token);

        console.log(`📝 [3/6] Évaluations (scale_teams)...`);
        const scaleTeams = await fetchAllPages('scale_teams', token);

        console.log(`📅 [4/6] Événements (events_users)...`);
        const eventsUsers = await fetchAllPages('events_users', token);

        console.log(`🛡️ [5/6] Coalitions...`);
        const coalitionsUsers = await fetchAllPages('coalitions_users', token);
        const coalitions = await fetchAllPages('coalitions', token);

        console.log(`🚀 [6/6] Projets & Récupération des descriptions (/v2/projects/:id)...`);
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
            projects_users: enrichedProjects
        });

        const outputPath = path.join(process.cwd(), 'assets/data/42/user_data.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        // Vérification avec le fichier existant
        if (fs.existsSync(outputPath)) {
            try {
                const existingRaw = fs.readFileSync(outputPath, 'utf8');
                const existingData = JSON.parse(existingRaw);

                // On compare les contenus en ignorant la propriété fetched_at
                const existingCompare = JSON.stringify({ ...existingData, fetched_at: null });
                const newCompare = JSON.stringify({ ...fullData, fetched_at: null });

                if (existingCompare === newCompare) {
                    console.log('ℹ️ Aucun changement dans les données. Fichier user_data.json conservé intact.');
                    return;
                }
            } catch (e) {
                // En cas d'erreur de lecture/parse, on continue et écrase le fichier
            }
        }

        // Formatage final avec fins de ligne LF (\n)
        const jsonContent = JSON.stringify(fullData, null, 2).replace(/\r\n/g, '\n') + '\n';
        fs.writeFileSync(outputPath, jsonContent, 'utf8');

        console.log(`✅ Nouvelles données enregistrées dans ${outputPath}`);
    } catch (error) {
        console.error('❌ Erreur :', error.message);
        process.exit(1);
    }
}

main();