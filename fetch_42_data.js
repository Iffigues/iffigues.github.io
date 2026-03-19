const fs = require('fs');

const getAccessToken = async (ci, cs) => {
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${ci}&client_secret=${cs}`
    });
    const data = await response.json();
    
    // VERIFICATION CRUCIALE
    if (!data.access_token) {
        throw new Error("❌ Erreur d'authentification : Vérifie tes Secrets GitHub (UID/SECRET) !");
    }
    return data.access_token;
};

async function findUserByLogin(token, targetLogin) {
    let page = 1;
    let foundUser = null;

    console.log(`🔍 Tentative de recherche pour : ${targetLogin}`);

    while (!foundUser) {
        // Utilisation du FILTER pour éviter de boucler sur 5000 pages (et éviter la 401/429)
        const url = `https://api.intra.42.fr/v2/users?filter[login]=${targetLogin}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            throw new Error("❌ Token invalide (401). Le Secret a peut-être expiré.");
        }

        const users = await response.json();
        
        if (!users || users.length === 0) {
            console.log("❌ Utilisateur introuvable avec ce filtre.");
            break;
        }

        foundUser = users.find(u => u.login === targetLogin);
        if (foundUser) return foundUser;
        
        break; // On s'arrête après le filtre
    }
    return null;
}

const run = async () => {
    try {
        // Utilisation des variables d'environnement de GitHub
        const ci = process.env.CLIENT_ID;
        const cs = process.env.CLIENT_SECRET;
        console.log(ci, cs)
        const token = await getAccessToken(ci, cs);
        console.log("✅ Token obtenu avec succès.");

        const userData = await findUserByLogin(token, "bordenoy");

        if (userData) {
            console.log(`✅ ID trouvé : ${userData.id}`);
            
            // On récupère le profil complet (avec l'ID) pour avoir TOUTES les infos
            const fullResponse = await fetch(`https://api.intra.42.fr/v2/users/${userData.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const fullData = await fullResponse.json();

            if (!fs.existsSync('_data')) fs.mkdirSync('_data');
            fs.writeFileSync('_data/denoyelle.json', JSON.stringify(fullData, null, 2));
            console.log("💾 _data/denoyelle.json mis à jour !");
        }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

run();
