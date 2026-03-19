const fs = require('fs');

// 1. Récupérer le Token d'accès
const getAccessToken = async (ci, cs) => {
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${ci}&client_secret=${cs}`
    });
    const data = await response.json();
    return data.access_token;
};

// 2. Récupérer l'ID numérique à partir du login
const getStudentId = async (token, login) => {
    const response = await fetch(`https://api.intra.42.fr/v2/users/${login}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Erreur login: ${response.status}`);
    const data = await response.json();
    return data.id;
};

// 3. Récupérer le profil complet via l'ID numérique
const getProfileById = async (token, id) => {
    const response = await fetch(`https://api.intra.42.fr/v2/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Erreur ID: ${response.status}`);
    return await response.json();
};

const run = async () => {
    try {
        const client_id = process.env.CLIENT_ID;
        const client_secret = process.env.CLIENT_SECRET;
        const target_login = "bordenoy"; 

        console.log("1. Authentification...");
        const token = await getAccessToken(client_id, client_secret);

        console.log(`2. Recherche de l'ID pour ${target_login}...`);
        const id = await getStudentId(token, target_login);
        console.log(`ID trouvé : ${id}`);

        console.log(`3. Récupération des données via l'ID ${id}...`);
        const profileData = await getProfileById(token, id);

        // Sauvegarde pour ton Jekyll
        if (!fs.existsSync('_data')) fs.mkdirSync('_data');
        fs.writeFileSync('_data/denoyelle.json', JSON.stringify(profileData, null, 2));
        
        console.log("Terminé : _data/denoyelle.json est prêt !");
    } catch (error) {
        console.error("Erreur dans le workflow :", error);
        process.exit(1);
    }
};

run();
