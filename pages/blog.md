---
layout: default
title: Blog
permalink: /blog/
custom_css:
  - /assets/css/blog.css
custom_js:
  - https://unpkg.com/lunr/lunr.js
  - /assets/js/blog-search.js
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
