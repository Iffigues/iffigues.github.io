import os
import re
import sys

def mettre_a_jour_liens_webp(dossier_racine):
    # Expression régulière pour trouver .jpg, .jpeg, .png (insensible à la casse)
    # On évite de remplacer si c'est déjà du .webp
    motif = re.compile(r'\.(jpg|jpeg|png)', re.IGNORECASE)
    
    extensions_cibles = {'.md', '.html', '.css', '.js', '.markdown'}
    compteur_fichiers = 0
    compteur_remplacements = 0

    print(f"--- Analyse du dossier : {dossier_racine} ---")

    for root, dirs, files in os.walk(dossier_racine):
        for name in files:
            extension = os.path.splitext(name)[1].lower()
            
            # On ne traite que les fichiers texte éditables
            if extension in extensions_cibles:
                chemin_fichier = os.path.join(root, name)
                
                try:
                    with open(chemin_fichier, 'r', encoding='utf-8') as f:
                        contenu = f.read()

                    # On vérifie si une modification est nécessaire
                    nouveau_contenu, nb_sub = motif.subn('.webp', contenu)

                    if nb_sub > 0:
                        with open(chemin_fichier, 'w', encoding='utf-8') as f:
                            f.write(nouveau_contenu)
                        print(f"📝 {name} : {nb_sub} lien(s) mis à jour.")
                        compteur_fichiers += 1
                        compteur_remplacements += nb_sub
                
                except Exception as e:
                    print(f"❌ Erreur sur {name} : {e}")

    print(f"\n--- Terminé ! ---")
    print(f"Fichiers modifiés : {compteur_fichiers}")
    print(f"Total des liens remplacés : {compteur_remplacements}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        path_a_traiter = sys.argv[1]
        if os.path.isdir(path_a_traiter):
            mettre_a_jour_liens_webp(path_a_traiter)
        else:
            print("Erreur : Le chemin n'est pas un dossier.")
    else:
        print("Usage : python script.py <chemin_du_site_jekyll>")