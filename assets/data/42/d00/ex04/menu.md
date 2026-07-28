---
layout: none
permalink: /ex04
---

<html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Menu Deroulant</title>
        <link rel="stylesheet" href="{{ '/assets/data/42/css/menu.css' | relative_url }}">
    </head>
    <body>
        <div class="dropdown">
            <button class="boutonmenuprincipal">Menu principal</button>
            <div class="dropdown-child">
                <a href="{{ '/ex00' | relative_url }}">Menu enfant</a>
                <a href="{{ '/ex01' | relative_url }}">Menu ado</a>
                <a href="{{ '/ex02' | relative_url }}">Menu adulte</a>
                <a href="{{ '/ex03' | relative_url }}">Menu vieux</a>
                <a href="{{ '/ex04' | relative_url }}">Menu vers de terre</a>
            </div>
        </div>
    </body>
</html>