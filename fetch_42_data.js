const fs = require('fs');

// Tes fonctions de base adaptées
const getAccessToken = async (ci, cs) => {
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${ci}&client_secret=${cs}`
    });
    const data = await response.json();
    return data.access_token;
};

const getMyProfile = async (token, login) => {
    const response = await fetch(`https://api.intra.42.fr/v2/users/${login}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
};

// La fonction principale qui sera lancée par GitHub
const run = async () => {
    try {
        // RÉCUPÉRATION DES SECRETS (configurés plus tard sur GitHub)
        const client_id = process.env.CLIENT_ID;
        const client_secret = process.env.CLIENT_SECRET;
        const target_login = "bordenoy"; // ou "bordenoy" selon ton besoin

        console.log("Récupération du token...");
        const token = await getAccessToken(client_id, client_secret);

        console.log(`Récupération du profil de ${target_login}...`);
        const profileData = await getMyProfile(token, target_login);

        // SAUVEGARDE POUR JEKYLL
        // On crée le dossier _data s'il n'existe pas
        if (!fs.existsSync('_data')) fs.mkdirSync('_data');
        
        // On écrit le fichier que Jekyll va lire
        fs.writeFileSync('_data/denoyelle.json', JSON.stringify(profileData, null, 2));
        
        console.log("Succès : _data/denoyelle.json a été mis à jour !");
    } catch (error) {
        console.error("Erreur durant le process :", error);
        process.exit(1); // Fait échouer l'action GitHub en cas d'erreur
    }
};

run();