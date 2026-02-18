import os
import sys
from PIL import Image

def convertir_recursivement(dossier_racine):
    # Formats cibles
    extensions = (".png", ".jpg", ".jpeg")
    compteur = 0

    # os.walk parcourt tous les sous-dossiers
    for dossier_actuel, sous_dossiers, fichiers in os.walk(dossier_racine):
        for fichier in fichiers:
            if fichier.lower().endswith(extensions):
                chemin_entree = os.path.join(dossier_actuel, fichier)
                
                # Création du nom de sortie (.webp remplace l'ancienne extension)
                nom_sans_ext = os.path.splitext(fichier)[0]
                chemin_sortie = os.path.join(dossier_actuel, f"{nom_sans_ext}.webp")

                try:
                    with Image.open(chemin_entree) as img:
                        # Conversion en mode RGB si nécessaire (pour éviter les erreurs avec certains JPG)
                        if img.mode in ("RGBA", "P") and fichier.lower().endswith((".jpg", ".jpeg")):
                            img = img.convert("RGB")
                        
                        # Sauvegarde en WebP (qualité 80 est le standard SEO)
                        img.save(chemin_sortie, "WEBP", quality=80)
                        print(f"✅ {chemin_entree} -> {nom_sans_ext}.webp")
                        compteur += 1
                except Exception as e:
                    print(f"❌ Erreur sur {fichier} : {e}")

    print(f"\n--- Terminé ! {compteur} images converties au total. ---")

if __name__ == "__main__":
    # Récupération du chemin passé en paramètre dans le terminal
    if len(sys.argv) > 1:
        path_a_traiter = sys.argv[1]
        if os.path.isdir(path_a_traiter):
            convertir_recursivement(path_a_traiter)
        else:
            print("Erreur : Le chemin fourni n'est pas un dossier valide.")
    else:
        print("Usage : python script.py <chemin_du_dossier>")