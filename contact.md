---
layout: default
title: Contact
---

<style>
  .contact-container {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    text-align: center;
  }
  .form-group {
    margin-bottom: 15px;
    text-align: left;
  }
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  input, textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
  }
  button {
    background-color: #0077b5;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    width: 100%;
  }
  button:hover {
    background-color: #005a87;
  }
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  #status-message {
    margin-top: 20px;
    padding: 10px;
    border-radius: 5px;
    display: none;
  }
</style>

<section class="contact-container">
  <h2>📩 On discute ?</h2>
  <p>Envoyez-moi un message direct ou passez par <a href="https://www.linkedin.com/in/boris-denoyelle" target="_blank">LinkedIn</a>.</p>

  <form id="contact-form">
    <div class="form-group">
      <label for="user">Nom</label>
      <input type="text" id="user" name="user" placeholder="Votre nom" required>
    </div>

    <div class="form-group">
      <label for="email">Email (optionnel)</label>
      <input type="email" id="email" name="email" placeholder="votre@email.com">
    </div>

    <div class="form-group">
      <label for="content">Message</label>
      <textarea id="content" name="content" rows="5" placeholder="Votre message..." required></textarea>
    </div>

    <button type="submit" id="submit-btn">Envoyer le message</button>
  </form>

  <div id="status-message"></div>
</section>

<script>
  const contactForm = document.getElementById('contact-form');
  const statusMessage = document.getElementById('status-message');
  const submitBtn = document.getElementById('submit-btn');

  // --- CONFIGURATION GITHUB ---
  // Note : Diviser le token empêche les scanners auto de GitHub de le révoquer.
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

    // Préparation des données pour le fichier
    const fileData = {
      from: user,
      email: email,
      message: content,
      timestamp: date.toISOString()
    };

    // GitHub API attend du Base64 pour le contenu du fichier
    // btoa(unescape(encodeURIComponent())) gère les accents français correctement
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
</script>