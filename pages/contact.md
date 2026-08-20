---
layout: default
title: Contact
custom_css: /assets/css/contact.css
custom_js:
  - /assets/js/contact.js
---

<section class="contact-container">
  <h2>📩 On discute ?</h2>
  <p>Envoyez-moi un message direct.</p>

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
