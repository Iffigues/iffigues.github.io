const fs = require('fs');

// 1. Ton modèle pour le Token
const getAccessToken = async (ci, cs) => {
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${ci}&client_secret=${cs}`
    });
    const data = await response.json();
    return data.access_token;
};

// 2. Ta logique : Boucler sur /v2/users jusqu'à trouver le pseudo
async function findUserByLogin(token, targetLogin) {
    let page = 1;
    let foundUser = null;

    console.log(`🔍 Recherche de ${targetLogin} dans la liste globale...`);

    while (!foundUser) {
        // On demande la page actuelle (100 utilisateurs max par page)
        const response = await fetch(`https://api.intra.42.fr/v2/users?page[number]=${page}&page[size]=100`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Erreur page ${page}: ${response.status}`);

        const users = await response.json();
        
        // Si la liste est vide, on a fait le tour sans trouver
        if (users.length === 0) break;

        // On cherche dans la page actuelle
        foundUser = users.find(user => user.login === targetLogin);

        if (foundUser) {
            console.log(`✅ Trouvé ! ID de ${targetLogin} : ${foundUser.id}`);
            return foundUser;
        }

        console.log(`Page ${page} vérifiée... (pas encore trouvé)`);
        page++;

        // Sécurité pour éviter de boucler à l'infini et brûler ton quota
        if (page > 50) { 
            console.log("⚠️ Arrêt après 50 pages pour protéger le quota.");
            break; 
        }
    }
    return null;
}

// 3. Le Runner
const run = async () => {
    try {
        const ci = process.env.CLIENT_ID;
        const cs = process.env.CLIENT_SECRET;
        const login = "bordenoy";

        const token = await getAccessToken(ci, cs);
        const userData = await findUserByLogin(token, login);

        if (userData) {
            // On récupère le profil complet avec l'ID trouvé
            const fullProfileResponse = await fetch(`https://api.intra.42.fr/v2/users/${userData.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const fullData = await fullProfileResponse.json();

            // Sauvegarde Jekyll
            if (!fs.existsSync('_data')) fs.mkdirSync('_data');
            fs.writeFileSync('_data/denoyelle.json', JSON.stringify(fullData, null, 2));
            console.log("📁 Fichier _data/denoyelle.json mis à jour.");
        } else {
            console.log("❌ Utilisateur non trouvé dans les premières pages.");
        }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
