/* assets/js/parcour.js */

document.addEventListener('DOMContentLoaded', () => {
    // Adapter si le chemin du JSON évolue
    const jsonPath = '/assets/data/42/user_data.json';

    const loadProfileData = async () => {
        try {
            // Utilise fetchBorisData si défini via api.js, sinon un fetch classique
            const fetchPromise = (typeof fetchBorisData === 'function') 
                ? fetchBorisData(jsonPath) 
                : fetch(jsonPath).then(res => res.json());

            const rawData = await fetchPromise;
            if (!rawData) throw new Error('Données introuvables');

            // Support de la structure directe ou via clé .user
            const user = rawData.user || rawData;

            // 1. Informations de profil
            const nameEl = document.getElementById('user-name');
            const picEl = document.getElementById('user-pic');
            const loginEl = document.getElementById('user-login');
            const emailEl = document.getElementById('user-email');

            if (nameEl) nameEl.textContent = user.displayname || user.usual_full_name || 'Nom non défini';
            if (picEl) picEl.src = user.image?.versions?.large || user.image?.link || '';
            if (loginEl) loginEl.textContent = `@${user.login || ''}`;
            if (emailEl) emailEl.textContent = user.email || '';

            // 2. Niveau et barre de progression
            const cursusUsers = user.cursus_users || rawData.cursus_users || [];
            const mainCursus = cursusUsers.find(c => c.cursus?.slug === '42cursus' || c.cursus_id === 21);

            if (mainCursus) {
                const level = mainCursus.level || 0;
                const levelValEl = document.getElementById('user-level-val');
                const levelBarEl = document.getElementById('user-level-bar');

                if (levelValEl) levelValEl.textContent = level.toFixed(2);
                if (levelBarEl) {
                    const progress = (level % 1) * 100;
                    levelBarEl.style.width = `${progress}%`;
                }
            }
        } catch (err) {
            console.error('❌ Erreur lors du chargement des données de parcours :', err);
            const nameEl = document.getElementById('user-name');
            if (nameEl) nameEl.textContent = 'Erreur de chargement';
        }
    };

    loadProfileData();
});