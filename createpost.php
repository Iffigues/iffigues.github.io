<?php

if ($argc < 2) {
    echo "Usage: php create_post.php \"Mon titre de post\"\n";
    exit(1);
}

// 1. Récupération du titre depuis l'argument
$title = $argv[1];

// 2. Génération automatique de la date
$currentDate = date('Y-m-d'); // 2026-02-02
$fullTimestamp = date('Y-m-d H:i:s O'); // 2026-02-02 13:00:00 +0100

// 3. Création du slug (nettoyage du titre pour le nom de fichier)
$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));

// 4. Nom du fichier formaté pour Jekyll
$filename = "_posts/".$currentDate . "-" . $slug . ".md";

// 5. Contenu du Front Matter
$content = <<<EOD
---
layout: post
title: "$title"
date: $fullTimestamp
categories: jekyll update
---

EOD;

// 6. Écriture du fichier
if (file_put_contents($filename, $content)) {
    echo "✅ Post créé : $filename\n";
} else {
    echo "❌ Erreur lors de la création du fichier.\n";
}