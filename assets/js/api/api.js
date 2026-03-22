/**
 * Récupère les données de Boris et retourne l'objet JSON
 */
async function fetchBorisData(url) {  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    
    const data = await response.json();
    return data; // C'est ici que l'objet est "propulsé" hors de la fonction
  } catch (error) {
    console.error("Impossible de charger les données 42:", error);
    return null; // On retourne null pour éviter de faire crash le reste du code
  }
}
