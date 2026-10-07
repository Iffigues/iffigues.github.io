const API_BASE_URL = 'https://217-182-206-51.sslip.io/api/search';

let currentQuery = '';
let currentPage = 1;
let maxPages = 1;

let activeSignatures = [];
let selectedLanguages = [];

// Rendre les fonctions d'effacement de tags accessibles globalement (évite les erreurs inline)
window.removeSignatureTag = function(index) {
    activeSignatures.splice(index, 1);
    renderSignatureTags();
};

window.removeLanguageTag = function(index) {
    selectedLanguages.splice(index, 1);
    renderLangTags();
};

document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const form = document.getElementById('search-form');
    const input = document.getElementById('query-input');
    const searchBtn = document.getElementById('search-btn');
    const statusDiv = document.getElementById('status');
    const resultsUl = document.getElementById('results');

    // Formulaire de saut de page
    const jumpForm = document.getElementById('jump-form');

    // Toggle Filtres
    const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
    const collapsibleFilters = document.getElementById('collapsible-filters');

    toggleFiltersBtn.addEventListener('click', () => {
        const isOpen = collapsibleFilters.classList.toggle('open');
        toggleFiltersBtn.classList.toggle('active', isOpen);
        toggleFiltersBtn.setAttribute('aria-expanded', isOpen);
    });

    const sortSelect = document.getElementById('sort-select');
    const orderSelect = document.getElementById('order-select');
    const perPageSelect = document.getElementById('per-page-select');

    // Filtres ciblés
    const topicInput = document.getElementById('topic-input');
    const userInput = document.getElementById('user-input');
    const orgInput = document.getElementById('org-input');
    const licenseSelect = document.getElementById('license-select');
    const forkSelect = document.getElementById('fork-select');
    const archivedSelect = document.getElementById('archived-select');
    const forksCountInput = document.getElementById('forks-count-input');
    const sizeInput = document.getElementById('size-input');
    const followersInput = document.getElementById('followers-input');
    const createdDateInput = document.getElementById('created-date-input');
    const locationInput = document.getElementById('location-input');      

    // Signatures / Empreintes
    const techSignatureInput = document.getElementById('tech-signature-input');
    const techOperatorSelect = document.getElementById('tech-operator-select');
    const addSignatureBtn = document.getElementById('add-signature-btn');

    if (addSignatureBtn && techSignatureInput) {
        addSignatureBtn.addEventListener('click', addSignatureTag);
        techSignatureInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSignatureTag();
            }
        });
    }

    function addSignatureTag() {
        const val = techSignatureInput.value.trim();
        if (!val) return;
        const op = techOperatorSelect ? techOperatorSelect.value : 'AND';
        activeSignatures.push({ value: val, operator: op });
        renderSignatureTags();
        techSignatureInput.value = '';
    }

    function renderSignatureTags() {
        const signaturesTagsList = document.getElementById('signatures-tags-list');
        if (!signaturesTagsList) return;
        signaturesTagsList.innerHTML = '';

        activeSignatures.forEach((sig, index) => {
            let prefix = '';
            if (sig.operator === 'NOT') prefix = 'NOT ';
            if (sig.operator === 'OR') prefix = 'OU ';

            const tag = document.createElement('div');
            tag.className = 'lang-tag';
            tag.innerHTML = `
                <span><strong>${prefix}</strong>${sig.value}</span>
                <span class="remove-tag" onclick="window.removeSignatureTag(${index})">&times;</span>
            `;
            signaturesTagsList.appendChild(tag);
        });
    }

    function processSignaturesFilter() {
        if (techSignatureInput && techSignatureInput.value.trim()) {
            addSignatureTag();
        }
        if (activeSignatures.length === 0) return null;

        let andParts = [], orParts = [], notParts = [];
        activeSignatures.forEach(sig => {
            if (sig.operator === 'NOT') notParts.push(`NOT ${sig.value}`);
            else if (sig.operator === 'OR') orParts.push(sig.value);
            else andParts.push(sig.value);
        });

        let queryParts = [];
        if (andParts.length > 0) queryParts.push(andParts.join(' '));
        if (orParts.length > 0) queryParts.push(orParts.length === 1 ? orParts[0] : `(${orParts.join(' OR ')})`);
        if (notParts.length > 0) queryParts.push(notParts.join(' '));

        return queryParts.join(' ');
    }

    // Gestion des Langages
    const langModeSelect = document.getElementById('lang-mode-select');
    const langModeSingle = document.getElementById('lang-mode-single');
    const langModeMulti = document.getElementById('lang-mode-multi');
    const langModeRaw = document.getElementById('lang-mode-raw');

    const langSingleInput = document.getElementById('lang-single-input');
    const langOperatorSelect = document.getElementById('lang-operator-select');
    const langMultiInput = document.getElementById('lang-multi-input');
    const addLangBtn = document.getElementById('add-lang-btn');
    const pushedLangRaw = document.getElementById('pushed-lang-raw');

    langModeSelect.addEventListener('change', () => {
        const mode = langModeSelect.value;
        langModeSingle.classList.toggle('hidden', mode !== 'single');
        langModeMulti.classList.toggle('hidden', mode !== 'multi');
        langModeRaw.classList.toggle('hidden', mode !== 'raw');
    });

    if (addLangBtn && langMultiInput) {
        addLangBtn.addEventListener('click', addLanguageTag);
        langMultiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addLanguageTag();
            }
        });
    }

    function addLanguageTag() {
        const val = langMultiInput.value.trim().toLowerCase();
        if (val) {
            const op = langOperatorSelect.value;
            const exists = selectedLanguages.some(l => l.lang === val && l.operator === op);
            if (!exists) {
                selectedLanguages.push({ lang: val, operator: op });
                renderLangTags();
                langMultiInput.value = '';
            }
        }
    }

    function renderLangTags() {
        const langTagsList = document.getElementById('lang-tags-list');
        if (!langTagsList) return;
        langTagsList.innerHTML = '';
        selectedLanguages.forEach((item, index) => {
            let prefix = item.operator === 'OR' ? 'OU ' : 'ET ';
            const tag = document.createElement('div');
            tag.className = 'lang-tag';
            tag.innerHTML = `
                <span><strong>${prefix}</strong>${item.lang}</span>
                <span class="remove-tag" onclick="window.removeLanguageTag(${index})">&times;</span>
            `;
            langTagsList.appendChild(tag);
        });
    }

    function processLanguageFilter() {
        const mode = langModeSelect.value;
        if (mode === 'single') return { languageParam: langSingleInput.value.trim() || null, queryExtra: null };
        if (mode === 'multi') {
            if (selectedLanguages.length === 0) return { languageParam: null, queryExtra: null };
            let andParts = [], orParts = [];
            selectedLanguages.forEach(item => {
                if (item.operator === 'OR') orParts.push(item.lang);
                else andParts.push(item.lang);
            });
            if (andParts.length > 0) return { languageParam: andParts.join('+'), queryExtra: null };
            if (orParts.length > 0) return { languageParam: orParts.join(','), queryExtra: null };
        }
        if (mode === 'raw') return { languageParam: null, queryExtra: pushedLangRaw.value.trim() || null };
        return { languageParam: null, queryExtra: null };
    }

    // Étoiles
    const starsModeSelect = document.getElementById('stars-mode-select');
    const starsControlsContainer = document.getElementById('stars-controls-container');
    const starsModeMin = document.getElementById('stars-mode-min');
    const starsModeRange = document.getElementById('stars-mode-range');
    const starsModeRaw = document.getElementById('stars-mode-raw');
    const starsMinInput = document.getElementById('stars-min-input');
    const starsRangeMin = document.getElementById('stars-range-min');
    const starsRangeMax = document.getElementById('stars-range-max');
    const starsRawInput = document.getElementById('stars-raw-input');

    starsModeSelect.addEventListener('change', () => {
        const mode = starsModeSelect.value;
        starsControlsContainer.classList.toggle('hidden', mode === 'none');
        starsModeMin.classList.toggle('hidden', mode !== 'min');
        starsModeRange.classList.toggle('hidden', mode !== 'range');
        starsModeRaw.classList.toggle('hidden', mode !== 'raw');
    });

    function buildStarsParam() {
        const mode = starsModeSelect.value;
        if (mode === 'min') return starsMinInput.value.trim() ? `>=${starsMinInput.value.trim()}` : null;
        if (mode === 'range') {
            const min = starsRangeMin.value.trim(), max = starsRangeMax.value.trim();
            if (min && max) return `${min}..${max}`;
            if (min) return `>=${min}`;
            if (max) return `<=${max}`;
        }
        if (mode === 'raw') return starsRawInput.value.trim() || null;
        return null;
    }

    // Dates
    const pushedModeSelect = document.getElementById('pushed-mode-select');
    const dateControlsContainer = document.getElementById('date-controls-container');
    const modeSingle = document.getElementById('mode-single');
    const modeRange = document.getElementById('mode-range');
    const modeRelative = document.getElementById('mode-relative');
    const modeRaw = document.getElementById('mode-raw');

    pushedModeSelect.addEventListener('change', () => {
        const mode = pushedModeSelect.value;
        dateControlsContainer.classList.toggle('hidden', mode === 'none');
        modeSingle.classList.toggle('hidden', mode !== 'single');
        modeRange.classList.toggle('hidden', mode !== 'range');
        modeRelative.classList.toggle('hidden', mode !== 'relative');
        modeRaw.classList.toggle('hidden', mode !== 'raw');
    });

    function buildPushedParam() {
        const mode = pushedModeSelect.value;
        if (mode === 'single') {
            const date = document.getElementById('pushed-date-input').value;
            return date ? `${document.getElementById('pushed-op-select').value}${date}` : null;
        }
        if (mode === 'range') {
            const start = document.getElementById('pushed-start-date').value;
            const end = document.getElementById('pushed-end-date').value;
            if (start && end) return `${start}..${end}`;
            if (start) return `>=${start}`;
            if (end) return `<=${end}`;
        }
        if (mode === 'relative') {
            const preset = document.getElementById('pushed-relative-select').value;
            const now = new Date();
            if (preset === '7d') now.setDate(now.getDate() - 7);
            else if (preset === '30d') now.setDate(now.getDate() - 30);
            else if (preset === '90d') now.setDate(now.getDate() - 90);
            else if (preset === '1y') now.setFullYear(now.getFullYear() - 1);
            else if (preset === 'this-year') return `>=${now.getFullYear()}-01-01`;
            return `>=${now.toISOString().split('T')[0]}`;
        }
        if (mode === 'raw') return document.getElementById('pushed-raw-input').value.trim() || null;
        return null;
    }

    sortSelect.addEventListener('change', () => {
        orderSelect.disabled = (sortSelect.value === '');
    });

    // Soumission de la recherche principale
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        currentQuery = input.value.trim();
        currentPage = 1;
        fetchResults(currentQuery, 1);
    });

    // Soumission du saut de page (JUMP FORM)
    if (jumpForm) {
        jumpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pageInput = document.getElementById('page-input');
            const pageNumber = parseInt(pageInput.value, 10);

            if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= maxPages) {
                fetchResults(currentQuery, pageNumber);
            }
        });
    }

    async function fetchResults(query, page) {
        setLoading(true);
        statusDiv.textContent = `Recherche en cours pour la page ${page}...`;
        resultsUl.innerHTML = '';

        const params = new URLSearchParams();
        let finalQueryParts = [];

        if (query) finalQueryParts.push(query);

        // Intégration du filtre in: (nom, description, readme)
        const selectedInFields = Array.from(document.querySelectorAll('.in-field-checkbox:checked')).map(cb => cb.value);
        if (selectedInFields.length > 0 && selectedInFields.length < 3) {
            finalQueryParts.push(`in:${selectedInFields.join(',')}`);
        }

        const signaturesExtra = processSignaturesFilter();
        if (signaturesExtra) finalQueryParts.push(signaturesExtra);

        const langResult = processLanguageFilter();
        if (langResult.queryExtra) finalQueryParts.push(langResult.queryExtra);

        const createdDate = createdDateInput.value.trim();
        if (createdDate) finalQueryParts.push(`created:${createdDate}`);

        const location = locationInput.value.trim();
        if (location) finalQueryParts.push(`location:${location}`);

        const forksCount = forksCountInput.value.trim();
        if (forksCount) finalQueryParts.push(`forks:${forksCount}`);

        params.append('q', finalQueryParts.join(' '));
        params.append('page', page);
        params.append('per_page', perPageSelect.value);

        if (langResult.languageParam) params.append('language', langResult.languageParam);
        if (topicInput.value.trim()) params.append('topic', topicInput.value.trim());
        if (userInput.value.trim()) params.append('user', userInput.value.trim());
        if (orgInput.value.trim()) params.append('org', orgInput.value.trim());
        if (licenseSelect.value) params.append('license', licenseSelect.value);
        if (forkSelect.value) params.append('fork', forkSelect.value);
        if (archivedSelect.value) params.append('archived', archivedSelect.value);
        if (sizeInput.value.trim()) params.append('size', sizeInput.value.trim());
        if (followersInput.value.trim()) params.append('followers', followersInput.value.trim());

        if (sortSelect.value) {
            params.append('sort', sortSelect.value);
            if (orderSelect.value) params.append('order', orderSelect.value);
        }

        const starsVal = buildStarsParam();
        if (starsVal) params.append('stars', starsVal);

        const pushedVal = buildPushedParam();
        if (pushedVal) params.append('pushed', pushedVal);

        try {
            const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
            if (!response.ok) throw new Error(`Erreur serveur : ${response.status}`);

            const data = await response.json();
            currentPage = data.current_page || page;
            maxPages = data.total_pages || 1;

            displayResults(data.pages_urls || data.items || []);
            setupPagination(data);
        } catch (err) {
            statusDiv.textContent = `Erreur : Impossible de contacter l'API (${err.message})`;
            document.getElementById('pagination').classList.add('hidden');
        } finally {
            setLoading(false);
        }
    }

    function displayResults(urls) {
        resultsUl.innerHTML = '';
        if (!urls || urls.length === 0) {
            statusDiv.textContent = 'Aucun site trouvé pour cette recherche.';
            return;
        }

        statusDiv.textContent = `${urls.length} résultat(s) trouvé(s) :`;
        urls.forEach(item => {
            const li = document.createElement('li');
            li.className = 'result-item';
            const a = document.createElement('a');
            
            const url = typeof item === 'string' ? item : item.html_url;
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = url;

            li.appendChild(a);
            resultsUl.appendChild(li);
        });
    }

    function setupPagination(data) {
        const paginationDiv = document.getElementById('pagination');
        if (!data.total_pages || data.total_pages <= 1) {
            paginationDiv.classList.add('hidden');
            return;
        }

        paginationDiv.classList.remove('hidden');
        document.getElementById('page-input').value = data.current_page;
        document.getElementById('page-input').max = data.total_pages;
        document.getElementById('max-page-info').textContent = `sur ${data.total_pages}`;

        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        prevBtn.disabled = !data.prev_page;
        nextBtn.disabled = !data.next_page;

        prevBtn.onclick = () => { if (data.prev_page) fetchResults(currentQuery, data.prev_page); };
        nextBtn.onclick = () => { if (data.next_page) fetchResults(currentQuery, data.next_page); };
    }

    function setLoading(isLoading) {
        searchBtn.disabled = isLoading;
        searchBtn.textContent = isLoading ? 'Chargement...' : 'Chercher';
    }
});