// Sur ton site Jekyll, dans un fichier .js
const getAccessToken = async (ci, cs) => {
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${ci}&client_secret=${cs}`
    });

    const data = await response.json();
    return data.access_token;
}

const getMyProfile = async (token) => {
    const response = await fetch('https://api.intra.42.fr/v2/users/42488', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const userData = await response.json();
    return(userData);
}


async function getStudentId(token, login = "bordenoy") {
    try {
        const response = await fetch(`https://api.intra.42.fr/v2/users/${login}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur: ${response.status}`);
        }

        const data = await response.json();
        
        // L'ID numérique est ici :
        console.log(`L'ID de ${login} est : ${data.id}`);
        return data.id;

    } catch (error) {
        console.error("Impossible de récupérer l'ID :", error);
    }
}


const bb = async () => {
id = "42488"
let b = await getAccessToken("", "")
console.log(b)
//let c = await getStudentId(b)
let cc = await  getMyProfile(b)
console.log(cc)
}

bb()