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
    box-sizing: border-box; /* Évite que l'input dépasse */
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

  // REMPLACE CETTE URL PAR TON URL DE SERVEUR (ex: https://ton-app.koyeb.app/message)
  const SERVER_URL = 'http://localhost:8080/message';

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Désactiver le bouton pendant l'envoi
    submitBtn.innerText = 'Envoi en cours...';
    submitBtn.disabled = true;

    const formData = {
      user: document.getElementById('user').value,
      content: document.getElementById('content').value,
      email: document.getElementById('email').value || null // Envoie null si vide
    };

    try {
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        statusMessage.style.display = 'block';
        statusMessage.style.backgroundColor = '#d4edda';
        statusMessage.style.color = '#155724';
        statusMessage.innerText = '✅ Message envoyé avec succès !';
        contactForm.reset();
      } else {
        throw new Error(result.message || 'Erreur lors de l\'envoi');
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
