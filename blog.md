---
layout: default
title: Blog
permalink: /blog/
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

<style>
/* Design Global */
.blog-container {
    max-width: 1000px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: 'Segoe UI', system-ui, sans-serif;
}

.blog-header {
    text-align: center;
    margin-bottom: 50px;
}

.blog-header h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 10px;
}

/* Barre de recherche */
.search-wrapper {
    position: relative;
    max-width: 500px;
    margin: 30px auto;
}

.search-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

#search-box {
    width: 100%;
    padding: 15px 15px 15px 45px;
    border: 2px solid #eee;
    border-radius: 50px;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

#search-box:focus {
    outline: none;
    border-color: #0077b5;
    box-shadow: 0 10px 20px rgba(0,119,181,0.1);
}

/* Grille d'articles */
.post-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
}

/* Cartes (Cards) */
.post-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #eaeaea;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.post-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
    border-color: #0077b5;
}

.post-content {
    padding: 25px;
    flex-grow: 1;
}

.post-date {
    font-size: 0.85rem;
    color: #0077b5;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.post-card h2 {
    margin: 15px 0;
    font-size: 1.4rem;
    line-height: 1.3;
}

.post-card h2 a {
    color: #333;
    text-decoration: none;
    transition: color 0.2s;
}

.post-card h2 a:hover {
    color: #0077b5;
}

.post-excerpt {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 20px;
}

.read-more {
    font-weight: bold;
    color: #0077b5;
    text-decoration: none;
    font-size: 0.9rem;
}

/* État "Aucun résultat" */
.no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px;
    color: #888;
    background: #f9f9f9;
    border-radius: 12px;
}

@media (max-width: 600px) {
    .post-grid { grid-template-columns: 1fr; }
}
</style>

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
