---
layout: default
custom_css:
  - /assets/css/post.css
---

<article class="post-wrapper">
  <header class="post-header">
    <h1 class="post-title">{{ page.title }}</h1>
    <p class="post-meta">
      <time datetime="{{ page.date | date_to_xmlschema }}">
        📅 {{ page.date | date: "%d %B %Y" }}
      </time>
    </p>
  </header>

  <div class="content-card post-content">
    {{ content }}
  </div>

  <footer class="post-footer">
    <a href="{{ '/blog' | relative_url }}" class="btn-back">← Retour au Blog</a>
  </footer>
</article>
