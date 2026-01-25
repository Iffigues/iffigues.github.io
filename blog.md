---
layout: default
title: Blog
permalink: /blog/
---

<h1>Articles du blog</h1>

<!-- Barre de recherche -->
<input type="text" id="search-box" placeholder="Rechercher un article..." style="padding: 10px; width: 100%; max-width: 400px; margin-bottom: 20px;">

<!-- Résultats de recherche -->
<ul id="search-results"></ul>

<!-- Résultats par défaut (si aucune recherche) -->
<ul id="post-list">
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> – {{ post.date | date: "%d %B %Y" }}
    </li>
  {% endfor %}
</ul>

<!-- Lunr.js + Script de recherche -->
<script src="https://unpkg.com/lunr/lunr.js"></script>
<script>
  let idx = null;
  let store = null;

  fetch('/lunr.json')
    .then(response => response.json())
    .then(data => {
      store = data.store;
      idx = lunr(function () {
        this.ref('id');
        this.field('title', { boost: 10 });
        this.field('content');
        this.field('categories');
        this.field('tags');

        for (let key in data.index) {
          this.add(data.index[key]);
        }
      });
    });

  document.getElementById('search-box').addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    const postList = document.getElementById('post-list');
    resultsContainer.innerHTML = '';

    if (!query || !idx) {
      postList.style.display = 'block';
      return;
    }

    postList.style.display = 'none';
    const results = idx.search(query);

    if (results.length === 0) {
      resultsContainer.innerHTML = '<li>Aucun résultat trouvé.</li>';
      return;
    }

    results.forEach(result => {
      const item = store[result.ref];
      const li = document.createElement('li');
      li.innerHTML = `<a href="${item.url}">${item.title}</a>`;
      resultsContainer.appendChild(li);
    });
  });
</script>
