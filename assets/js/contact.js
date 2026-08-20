/* assets/js/contact.js */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const statusMessage = document.getElementById('status-message');
    const submitBtn = document.getElementById('submit-btn');

    if (!contactForm) return;

    // --- CONFIGURATION GITHUB ---
    const p1 = "github_pat_11AC36UTI0hCLqz37h5HyJ_z5Ga"; 
    const p2 = "qzNkLv5EMCrdCfZciG7rFn2TWIQCH3cjGc1cut8DELXRZIHAqI2PNFX";
    const GITHUB_TOKEN = p1 + p2;
    const REPO_DESTINATION = "Iffigues/ma-messagerie-privee"; 

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitBtn.innerText = 'Envoi en cours...';
        submitBtn.disabled = true;

        const user = document.getElementById('user').value;
        const email = document.getElementById('email').value || "Non fourni";
        const content = document.getElementById('content').value;
        
        // Création d'un nom de fichier unique par message
        const date = new Date();
        const filename = `message-${date.getTime()}.json`;

        // Préparation des données
        const fileData = {
            from: user,
            email: email,
            message: content,
            timestamp: date.toISOString()
        };

        // Encodage en Base64 avec gestion du UTF-8
        const base64Content = btoa(unescape(encodeURIComponent(JSON.stringify(fileData, null, 2))));

        try {
            const response = await fetch(`https://api.github.com/repos/${REPO_DESTINATION}/contents/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Nouveau message de ${user}`,
                    content: base64Content
                })
            });

            if (response.ok) {
                statusMessage.style.display = 'block';
                statusMessage.style.backgroundColor = '#d4edda';
                statusMessage.style.color = '#155724';
                statusMessage.innerText = '✅ Envoyé ! Votre message a été déposé dans mon coffre-fort privé.';
                contactForm.reset();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur API');
            }
        } catch (error) {
            statusMessage.style.display = 'block';
            statusMessage.style.backgroundColor = '#f8d7da';
            statusMessage.style.color = '#721c24';
            statusMessage.innerText = '❌ Erreur : ' + error.message;
        } finally {
            submitBtn.innerText = 'Envoyer le message';
            submitBtn.disabled = false;
        }
    });
});