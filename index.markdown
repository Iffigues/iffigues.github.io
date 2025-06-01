---
layout: default
title: Accueil
---

# Bienvenue

Voici la page d’accueil de mon site personnalisé.

<h2>Articles récents</h2>
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> – {{ post.date | date: "%d %B %Y" }}
    </li>
  {% endfor %}
</ul>