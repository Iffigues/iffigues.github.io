---
layout: default
title: Blog
permalink: /blog/
custom_css:
  - /assets/css/blog.css
---

<section class="blog-container">
    <div class="blog-header">
        <h1>Articles du blog</h1>
        <p>Découvrez mes projets, mes réflexions et mes découvertes techniques.</p>
        
        <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="search-box" placeholder="Rechercher un sujet, un tag, un projet...">
        </div>
    </div>

    <div id="search-results" class="post-grid"></div>

    <div id="post-list" class="post-grid">
        {% for post in site.posts %}
        <article class="post-card">
            <div class="post-content">
                <span class="post-date">{{ post.date | date: "%d %b %Y" }}</span>
                <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
               <p class="post-excerpt">

{{ post.content | strip_html | normalize_whitespace | truncatewords: 25 }}

</p>
                <div class="post-footer">
                    <a href="{{ post.url }}" class="read-more">Lire la suite →</a>
                </div>
            </div>
        </article>
        {% endfor %}
    </div>
</section>

<script src="https://unpkg.com/lunr/lunr.js"></script>
<script>
    let idx = null;
    let store = null;

    fetch('{{ "/lunr.json" | relative_url }}')
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
            postList.style.display = 'grid';
            resultsContainer.style.display = 'none';
            return;
        }

        postList.style.display = 'none';
        resultsContainer.style.display = 'grid';
        
        const results = idx.search(query);

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">🕵️ Aucun article ne correspond à votre recherche.</div>';
            return;
        }

        results.forEach(result => {
            const item = store[result.ref];
            const div = document.createElement('article');
            div.className = 'post-card';
            div.innerHTML = `
                <div class="post-content">
                    <span class="post-date">Résultat de recherche</span>
                    <h2><a href="${item.url}">${item.title}</a></h2>
                    <p class="post-excerpt">${item.content.substring(0, 120)}...</p>
                    <div class="post-footer">
                        <a href="${item.url}" class="read-more">Lire l'article →</a>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(div);
        });
    });
</script>
