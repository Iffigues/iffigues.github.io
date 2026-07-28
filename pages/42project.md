---
layout: default
title: School 42 - Web Projects
---

<style>
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 20px;
  }

  .project-card {
    display: flex;
    flex-direction: column;
    padding: 16px;
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 8px;
    text-decoration: none;
    color: #fff;
    font-family: system-ui, -apple-system, sans-serif;
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .project-card:hover {
    transform: translateY(-3px);
    border-color: #00babc;
  }

  .project-code {
    font-family: monospace;
    font-size: 0.8rem;
    color: #00babc;
    margin-bottom: 6px;
    text-transform: uppercase;
  }

  .project-title {
    font-size: 1rem;
    font-weight: 600;
  }
</style>

<div class="projects-grid">
  <a class="project-card" href="{{ '/exo00' | relative_url }}">
    <span class="project-code">ex00</span>
    <span class="project-title">Basics & HTML</span>
  </a>

  <a class="project-card" href="{{ '/exo01' | relative_url }}">
    <span class="project-code">ex01</span>
    <span class="project-title">Mendeleïev</span>
  </a>

  <a class="project-card" href="{{ '/exo02' | relative_url }}">
    <span class="project-code">ex02</span>
    <span class="project-title">Layout & Tables</span>
  </a>

  <a class="project-card" href="{{ '/exo03' | relative_url }}">
    <span class="project-code">ex03</span>
    <span class="project-title">Responsive CSS</span>
  </a>

  <a class="project-card" href="{{ '/exo04' | relative_url }}">
    <span class="project-code">ex04</span>
    <span class="project-title">Menu Déroulant</span>
  </a>
</div>