// github-search/api.js

const API_BASE_URL = 'https://217-182-206-51.sslip.io/api/search';

export async function searchRepositories(params) {
    const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
    }
    return await response.json();
}