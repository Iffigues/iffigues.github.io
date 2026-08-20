---
layout: default
title: School 42 - Web Projects
custom_css:
  - /assets/css/42.css
  - /assets/css/project.css
---

<div class="page-42-wrapper">
        <header class="section-header">
        <h1><span class="glitch">42</span> : Le cursus</h1>
        <div class="main-nav-buttons">
        <a href="{{ '/42' | relative_url }}"><button id="btn-projects" class="btn-42">42</button></a>
            <a href="{{ '/42profil' | relative_url }}"><button id="btn-profil" class="btn-42">Profil</button></a>
            <a href="{{ '/42time' | relative_url }}"><button id="btn-profil" class="btn-42">Time</button></a>
            <a href="{{ '/42coalition' | relative_url }}"><button id="btn-profil" class="btn-42">Coalitions</button></a>
        </div>
    </header>
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
</div>
