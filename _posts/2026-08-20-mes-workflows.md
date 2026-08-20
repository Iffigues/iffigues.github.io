---
layout: post
title: "mes-workflows"
date: 2026-08-20 12:01:50 +0000
categories: jekyll update
---

Au fil du développement de mon portfolio, j'ai commencé à accumuler quelques tâches répétitives : convertir les images, optimiser les PDF, vérifier les liens ou encore mettre à jour les données de mon profil **École 42**.

Plutôt que de continuer à faire tout cela manuellement, j'ai progressivement mis en place plusieurs **workflows GitHub Actions**.

L'idée n'était pas de construire une usine à gaz, mais simplement d'automatiser ce qui pouvait l'être et de laisser GitHub s'occuper des petites tâches de maintenance à ma place.

## GitHub Actions au service de mon portfolio

Aujourd'hui, plusieurs workflows tournent autour du site, chacun avec une responsabilité assez simple.

Certains se déclenchent automatiquement lors d'un `push`, d'autres à intervalles réguliers et certains peuvent être lancés manuellement lorsque j'en ai besoin.

Cela me permet de garder un dépôt relativement propre tout en évitant plusieurs manipulations répétitives.

## Vérifier automatiquement les liens

Un site évolue et les liens aussi. Une ressource externe peut disparaître, une URL peut changer ou je peux simplement faire une erreur en ajoutant un nouveau lien.

J'utilise donc un workflow basé sur **Lychee** pour parcourir les liens présents sur le site et détecter ceux qui ne fonctionnent plus.

La vérification peut être effectuée lors des modifications du projet, mais elle est également planifiée régulièrement.

L'intérêt est assez simple : je n'ai pas besoin de parcourir périodiquement toutes les pages du site pour vérifier les liens un par un.

## Garder mon profil 42 à jour

Ma page **Profil 42** affiche différentes informations liées à mon cursus : niveau, projets, compétences et autres données de mon parcours.

Ces informations provenant de l'API de 42, je ne voulais évidemment pas devoir modifier manuellement un fichier à chaque changement.

Un workflow se charge donc régulièrement de lancer un script **Node.js** qui récupère les données nécessaires et met à jour le fichier utilisé par mon site.

Si les données ont changé, le workflow peut ensuite enregistrer automatiquement la nouvelle version dans le dépôt.

J'ai également conservé la possibilité de lancer une synchronisation manuellement depuis GitHub Actions.

C'est probablement l'automatisation que j'apprécie le plus sur le site : ma page 42 peut continuer à évoluer sans que j'aie besoin d'intervenir à chaque modification.

## Convertir automatiquement mes images en WebP

Les images sont souvent responsables d'une bonne partie du poids d'une page web.

Je pourrais évidemment penser à convertir chaque image avant de l'ajouter au site... mais je sais aussi que je finirais par oublier.

J'ai donc préféré automatiser cette étape.

Lorsqu'une nouvelle image compatible est ajoutée au projet, un workflow génère sa version **WebP** afin d'obtenir un fichier plus léger et mieux adapté au web.

L'original est conservé dans une archive afin de ne pas perdre le fichier source.

Cette automatisation me permet surtout d'avoir une règle simple : **j'ajoute mon image et le workflow s'occupe du reste**.

## Optimiser les PDF

J'utilise également quelques documents PDF sur mon site, notamment pour mon CV.

Comme pour les images, j'ai voulu automatiser leur optimisation.

Mon workflow utilise notamment **Ghostscript** pour optimiser les fichiers ainsi qu'**ExifTool** pour travailler sur leurs métadonnées.

Là encore, je conserve les fichiers originaux dans une archive.

Ce n'est pas forcément l'automatisation la plus impressionnante, mais elle évite de devoir penser à optimiser manuellement chaque nouveau document avant de le publier.

## Des workflows simples plutôt qu'une usine à gaz

Ce que j'aime avec GitHub Actions, c'est qu'il n'est pas nécessaire d'avoir une grosse infrastructure pour que l'automatisation soit utile.

Mon portfolio reste un site personnel hébergé sur **GitHub Pages**. Pourtant, quelques workflows me permettent déjà de :

- vérifier régulièrement mes liens ;
- synchroniser mes données 42 ;
- convertir mes images en WebP ;
- optimiser mes PDF ;
- déclencher certaines opérations manuellement lorsque j'en ai besoin.

Chaque automatisation prise séparément fait finalement assez peu de choses.

Mais mises ensemble, elles enlèvent plusieurs petites tâches auxquelles je n'ai plus besoin de penser.

## Une autre façon d'aborder le DevOps

Quand on parle de **DevOps** ou de **CI/CD**, on pense rapidement à Docker, Kubernetes, aux pipelines complexes et aux grosses infrastructures.

Mais pour moi, l'idée commence aussi beaucoup plus simplement : **identifier une tâche répétitive et chercher comment ne plus avoir à la refaire manuellement**.

Mon portfolio est un bon terrain d'expérimentation pour ça.

Je peux tester une idée, écrire un workflow, voir comment il se comporte et l'améliorer progressivement sans chercher à rendre les choses inutilement complexes.

Au final, ces GitHub Actions ne transforment pas mon portfolio en infrastructure extraordinaire.

Elles font quelque chose de beaucoup plus utile à mon échelle : **elles me simplifient la vie**.

Et c'est exactement ce que j'attends d'une bonne automatisation.
