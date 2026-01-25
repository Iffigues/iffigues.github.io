---
layout: default
title: Contact
---


<style>
  s
  .contact a {
    color: #0077cc;
    text-decoration: none;
  }
</style>

<div class="portfolio">
 <div class="section contact">
  <h2>📬 Contact</h2>
  <form id="contact-form">
    <label for="pseudo">Pseudo :</label>
    <input type="text" id="pseudo" name="pseudo" required>
    <label for="message">Message :</label>
    <textarea id="message" name="message" rows="5" required></textarea>
    <button type="submit">Envoyer</button>
  </form>
  <p id="form-status"></p>
</div>

<script>
  document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const pseudo = document.getElementById('pseudo').value;
    const message = document.getElementById('message').value;

    // Crée l'objet à envoyer
    const data = {
      pseudo: pseudo,
      commentaire: message
    };

    // Envoie les données au serveur Go
    fetch('http://gopiko.fr:8080/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi");
      }
      return response.json();
    })
    .then(result => {
      document.getElementById('form-status').textContent = result.message || "Message envoyé !";
    })
    .catch(error => {
      document.getElementById('form-status').textContent = "Erreur : " + error.message;
    });

    // Optionnel : reset le formulaire
    this.reset();
  });
</script>



</div>