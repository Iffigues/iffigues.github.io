---
layout: post
title: "github action"
date: 2026-02-25 22:36:04 +0000
categories: jekyll update
---
La performance d'un site web dépend énormément du poids des assets. Sur un portfolio ou un blog, charger des images JPG de plusieurs mégaoctets ou des PDF non optimisés ralentit l'expérience utilisateur et nuit au référencement.

Pour mon site sous Jekyll, j'ai mis en place un système d'automatisation via **GitHub Actions** qui traite mes fichiers à chaque `git push`.

---

## Le Workflow : Optimisation en arrière-plan

L'objectif est de pouvoir uploader des fichiers en haute définition sans impacter le site final. À chaque déploiement, le pipeline exécute deux tâches principales.



### 1. Conversion systématique en WebP
Le script scanne le projet pour identifier les fichiers `.jpg`, `.jpeg` et `.png`.
* **Action** : Il génère une version `.webp` (format compressé moderne).
* **Archivage** : L'image originale est déplacée dans un dossier `/old`.
* **Structure** : Le script recrée l'arborescence exacte des dossiers dans l'archive pour éviter tout conflit de nom.

### 2. Compression et Anonymisation des PDF
Pour les documents comme le CV ou les diplômes, le pipeline utilise **Ghostscript** et **Exiftool**.
* **Ghostscript** : Réduit la taille du fichier en optimisant la résolution interne.
* **Exiftool** : Supprime toutes les métadonnées (nom de l'auteur, logiciel de création, dates). C'est une étape essentielle pour la confidentialité.
* **Archivage** : Le document original est sauvegardé dans `/oldpdf`.

---

## Une gestion intelligente des fichiers

Pour éviter de traiter inutilement des fichiers déjà optimisés ou de créer des boucles de commits, j'ai intégré une condition de vérification. Le script compare le fichier source avec l'archive avant d'agir.

```bash
# Calcul du chemin dans l'archive miroir
archive_path="old/${dirname#./}/$filename"

# Vérification : si l'original est déjà archivé, on ignore le fichier
if [ -f "$archive_path" ]; then
  echo "-> Fichier déjà traité. Passage au suivant."
  continue
fi