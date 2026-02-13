---
layout: post
title: "bapteme timer"
date: 2026-02-13 11:01:26 +0000
categories: jekyll update
---


Le cheminement vers le baptême est une aventure spirituelle, mais c'est aussi une attente impatiente ! Pour marquer les jours qui me séparent de la **Vigile Pascale**, j'ai décidé de créer un compte à rebours personnalisé sur mon site.

## Le défi technique : Une date qui "bouge"

Au début, j'avais simplement codé une date fixe dans mon script. Mais j'ai vite appris que la date du baptême des catéchumènes n'est jamais la même d'une année sur l'autre ! 

Contrairement à Noël qui tombe toujours le 25 décembre, le baptême dépend de **Pâques**. Et Pâques est calculé selon une règle précise : c'est le premier dimanche après la première pleine lune de printemps.

### Comment j'ai résolu le problème

Pour que mon timer soit toujours juste (même si je le regarde l'année prochaine !), j'ai dû intégrer un algorithme mathématique (celui de *Meeus/Jones/Butcher*) dans mon code JavaScript. 

Désormais, le script :
1. Analyse l'année en cours.
2. Calcule la phase de la lune et l'équinoxe de printemps.
3. Détermine automatiquement la date du **Samedi Saint** à 20h00.

## Le Compte à Rebours en direct

Voici le résultat final. Ce timer calcule en temps réel le temps qu'il reste avant de recevoir les sacrements :

<iframe 
    src="/l" 
    width="100%" 
    height="300px" 
    frameborder="0" 
    style="border: 2px solid #ececec; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</iframe>

---

### Pourquoi ce projet ?

Ce petit bout de code est plus qu'un simple gadget. C'est un rappel quotidien de mon engagement et de la fête de la Résurrection qui approche. Chaque seconde qui défile me rapproche un peu plus de cette nuit de lumière.

> "Le baptême est le sacrement de la foi." (Saint Augustin)
