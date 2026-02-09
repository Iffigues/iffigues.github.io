---
layout: post
title: "slice e tarray"
date: 2026-02-09 17:08:37 +0000
categories: jekyll update
---

<p>En Go, la différence entre un <strong>array</strong> et un <strong>slice</strong> est fondamentale. comprendre ce qui se passe sous le capot est essentiel pour éviter les fuites de mémoire et les effets de bord inattendus.</p>

<hr>

<h2>1. L'Array : Le bloc statique</h2>
<p>L'array a une taille fixe définie à la compilation. En Go, un array est une <strong>valeur</strong>. Cela signifie que si vous passez un array à une fonction, Go copie l'intégralité des données.</p>

<pre><code>// Un array de 4 entiers
var staticArray [4]int = [4]int{1, 2, 3, 4}
</code></pre>

<h2>2. Le Slice : Le descripteur dynamique</h2>
<p>Un slice est une structure légère (24 octets) qui pointe vers un array sous-jacent. Il est composé de trois éléments :</p>
<ul>
    <li><strong>Pointer :</strong> L'adresse mémoire du début du slice.</li>
    <li><strong>Length (len) :</strong> Le nombre d'éléments actuels.</li>
    <li><strong>Capacity (cap) :</strong> La limite de l'array sous-jacent.</li>
</ul>

<blockquote>
    <strong>Mécanisme de réallocation :</strong> Lorsque vous utilisez <code>append()</code> et que la capacité est dépassée, Go alloue un nouvel array (souvent de taille double), y copie les données et redirige le pointeur.
</blockquote>

<hr>

<h2>3. Pointeur d'Array vs Slice : Le débat</h2>
<p>Vous pourriez vous demander : <em>"Si je passe un pointeur d'array (<code>*[N]int</code>), c'est aussi performant qu'un slice ?"</em></p>
<p><strong>La réponse est oui, mais c'est rigide.</strong></p>

<table>
    <thead>
        <tr>
            <th>Caractéristique</th>
            <th>Pointeur d'Array (<code>*[3]int</code>)</th>
            <th>Slice (<code>[]int</code>)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Poids (paramètre)</strong></td>
            <td>8 octets</td>
            <td>24 octets</td>
        </tr>
        <tr>
            <td><strong>Flexibilité</strong></td>
            <td>Nul (taille fixe)</td>
            <td>Totale (taille variable)</td>
        </tr>
        <tr>
            <td><strong>Usage</strong></td>
            <td>Cryptographie, calcul bas-niveau</td>
            <td>Standard Go</td>
        </tr>
    </tbody>
</table>

<p>Le slice est souvent préféré car il offre la puissance du pointeur (pas de copie des données lourdes) tout en permettant d'utiliser des fonctions génériques quelle que soit la taille de la structure.</p>

<hr>

<h2>4. Erreurs classiques et Gestion mémoire</h2>

<h3>A. La fuite de mémoire (Memory Leak)</h3>
<p>Si vous créez un petit slice à partir d'un array gigantesque, l'array géant reste en mémoire tant que le slice existe.</p>

<pre><code>// MAUVAIS : L'array de 1Go survit en mémoire
func getSmall() []byte {
    bigData := make([]byte, 1&lt;&lt;30) 
    return bigData[:10] 
}

// BIEN : On copie pour libérer le gros bloc
func getSmallFixed() []byte {
    bigData := make([]byte, 1&lt;&lt;30)
    res := make([]byte, 10)
    copy(res, bigData[:10])
    return res
}
</code></pre>

<h3>B. L'effet de bord inattendu</h3>
<p>Puisque le slice pointe vers un array, modifier un slice peut en modifier un autre s'ils partagent le même array sous-jacent.</p>

<pre><code>a := []int{1, 2, 3}
b := a[:2]
b[0] = 999 
// a[0] vaut maintenant 999 !
</code></pre>

<hr>

<h2>Conclusion</h2>
<p>Privilégiez les <strong>slices</strong> pour leur flexibilité. Si vous connaissez la taille finale, utilisez <code>make([]type, len, cap)</code> pour éviter les réallocations inutiles. Gardez les pointeurs d'arrays pour les cas où la taille est une contrainte métier stricte et immuable.</p>