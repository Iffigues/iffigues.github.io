/* assets/js/blog-search.js */

document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('search-box');
    const resultsContainer = document.getElementById('search-results');
    const postList = document.getElementById('post-list');

    if (!searchBox || !resultsContainer || !postList) return;

    let idx = null;
    let store = null;

    const jsonPath = `${window.siteBaseUrl || ''}/lunr.json`;

    // Chargement de l'index de recherche Lunr
    fetch(jsonPath)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
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
        })
        .catch(err => console.error('❌ Erreur de chargement de l\'index Lunr :', err));

    // Gestionnaire de recherche en temps réel
    searchBox.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();
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
            if (!item) return;

            const div = document.createElement('article');
            div.className = 'post-card';
            div.innerHTML = `
                <div class="post-content">
                    <span class="post-date">Résultat de recherche</span>
                    <h2><a href="${item.url}">${item.title}</a></h2>
                    <p class="post-excerpt">${item.content ? item.content.substring(0, 120) + '...' : ''}</p>
                    <div class="post-footer">
                        <a href="${item.url}" class="read-more">Lire l'article →</a>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(div);
        });
    });
});