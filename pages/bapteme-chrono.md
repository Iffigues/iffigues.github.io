---
layout: default
title: bapteme timer
---

<style>
  /* On supprime les marges internes du conteneur de ton thème */
  .post-content, .wrapper, main, .content {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* On retire les marges automatiques sur les paragraphes si l'iframe est dedans */
  p { margin: 0; padding: 0; line-height: 0; }

  /* L'iframe en elle-même */
  iframe {
    display: block; /* Supprime l'espace résiduel sous l'image/iframe */
    vertical-align: bottom;
  }
</style>

<div style="width: 100%; height: calc(100vh - 140px); overflow: hidden; margin: 0; padding: 0;">
    <iframe 
        src="/bapteme-timer" 
        style="width: 100%; height: 100%; border: none; margin: 0; padding: 0;" 
        frameborder="0">
    </iframe>
</div>