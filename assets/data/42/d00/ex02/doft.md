---
layout: none
permalink: /ex02
---

<html>
    <head>
        <meta charset="UTF-8">
        <title>Day of the 42</title>
        <link rel="stylesheet" href="{{ '/assets/data/42/css/doft.css' | relative_url }}">
    </head>
    <body>
        <div id="day">
            <div id="top"> 
                <img id="doth" width="50%" height="100%" src="{{ '/assets/data/42/ressources/day_of_the_42.png' | relative_url }}" />
                <img id="loupe" width="30%" height="100%" src="{{ '/assets/data/42/ressources/loupe.png' | relative_url }}"/>
                <a href="https://www.disney.com"><img id="reload" title="Recommencer au debut" width="10%" height="20%" src="{{ '/assets/data/42/ressources/reload.png' | relative_url }}"/></a>
                <a href="https://www.relaischateaux.com/fr/"><img id="close" title="Deconnecter" width="10%" height="20%" src="{{ '/assets/data/42/ressources/close.gif' | relative_url }}"/></a>
            </div>
            <div id="left">
                <img id="arrow" width="100%" height="18%" src="{{ '/assets/data/42/ressources/arrow.png' | relative_url }}" title="Avancer" />
                <img id="main" width="100%" height="18%" src="{{ '/assets/data/42/ressources/main.png' | relative_url }}" title="Prendre" />
                <img id="oeil" width="100%" height="18%" src="{{ '/assets/data/42/ressources/oeil.png' | relative_url }}" title="Regarder" />
                <img id="outil" width="100%" height="18%" src="{{ '/assets/data/42/ressources/outil.png' | relative_url }}" title="Utiliser"/>
                <img id="chat" width="100%" height="18%" src="{{ '/assets/data/42/ressources/chat-icon.png' | relative_url }}" title="Parler"/>
            </div>
            <div id="middle">
                <a href="https://www.apple.com/"><div id="lol"></div></a>
                <a href="https://www.ikea.com/"><div id="lil"></div></a>
                <img id="cluster" width="100%" height="100%" src="{{ '/assets/data/42/ressources/cluster.jpg' | relative_url }}"/>
                <div id="fa">
                    <p style="position:absolute; top:2%;">Vous entrer alors dans une grande piece remplie</p>
                    <p style="position:absolute; top:13%; text-shadow: red 0.1em 0.1em 0.2em;">d'ordinateurs.</p>
                    <p style="position:absolute; top:24%;">- Bonjour, vous etes nouveau ici?</p>
                    <input type="text" style="position:absolute; top:40%;left: 2%; width:60%;height:11%"/>
                    <input value="Repondre" type="submit" style="position:absolute; top:40%; left:65%; width: 20%; height:40%!important; font-size: 1vw; border-radius: 0px;" />                   
                </div>
            </div>
            <div id="right">
                <img id="book" width="100%" height="18%" src="{{ '/assets/data/42/ressources/book.png' | relative_url }}"/>
                <img id="towel" width="100%" height="18%" src="{{ '/assets/data/42/ressources/towel.png' | relative_url }}"/>
                <div id="brick" style="width:80%; height:10%; background-image:url('{{ '/assets/data/42/ressources/brick.jpg' | relative_url }}');"></div>
            </div>
        </div>
    </body>
</html>