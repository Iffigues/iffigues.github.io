document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://in-long-aurora-7849.fly.dev/api/search';

    let currentQuery = '';
    let currentPage = 1;
    let maxPages = 1;

    // Éléments du DOM principaux
    const form = document.getElementById('search-form');
    const input = document.getElementById('query-input');
    const searchBtn = document.getElementById('search-btn');
    const statusDiv = document.getElementById('status');
    const resultsUl = document.getElementById('results');

    // Toggle Filtres
    const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
    const collapsibleFilters = document.getElementById('collapsible-filters');

    if (toggleFiltersBtn && collapsibleFilters) {
        toggleFiltersBtn.addEventListener('click', () => {
            const isOpen = collapsibleFilters.classList.toggle('open');
            toggleFiltersBtn.classList.toggle('active', isOpen);
            toggleFiltersBtn.setAttribute('aria-expanded', isOpen);
        });
    }

    const sortSelect = document.getElementById('sort-select');
    const orderSelect = document.getElementById('order-select');
    const perPageSelect = document.getElementById('per-page-select');

    // LOGIQUE DES LANGAGES
    const langModeSelect = document.getElementById('lang-mode-select');
    const langModeSingle = document.getElementById('lang-mode-single');
    const langModeMulti = document.getElementById('lang-mode-multi');
    const langModeRaw = document.getElementById('lang-mode-raw');

    const langSingleInput = document.getElementById('lang-single-input');
    const langOperatorSelect = document.getElementById('lang-operator-select');
    const langMultiInput = document.getElementById('lang-multi-input');
    const addLangBtn = document.getElementById('add-lang-btn');
    const langTagsList = document.getElementById('lang-tags-list');
    const pushedLangRaw = document.getElementById('pushed-lang-raw');

    let selectedLanguages = [];

    if (langModeSelect) {
        langModeSelect.addEventListener('change', () => {
            const mode = langModeSelect.value;
            langModeSingle.classList.toggle('hidden', mode !== 'single');
            langModeMulti.classList.toggle('hidden', mode !== 'multi');
            langModeRaw.classList.toggle('hidden', mode !== 'raw');
        });
    }

    if (addLangBtn) {
        addLangBtn.addEventListener('click', addLanguageTag);
    }

    if (langMultiInput) {
        langMultiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addLanguageTag();
            }
        });
    }

    function addLanguageTag() {
        const val = langMultiInput.value.trim().toLowerCase();
        if (val && !selectedLanguages.includes(val)) {
            selectedLanguages.push(val);
            renderLangTags();
            langMultiInput.value = '';
        }
    }

    window.removeLanguageTag = function(lang) {
        selectedLanguages = selectedLanguages.filter(l => l !== lang);
        renderLangTags();
    };

    function renderLangTags() {
        langTagsList.innerHTML = '';
        selectedLanguages.forEach(lang => {
            const tag = document.createElement('div');
            tag.className = 'lang-tag';
            tag.innerHTML = `<span>${lang}</span><span class="remove-tag" onclick="removeLanguageTag('${lang}')">&times;</span>`;
            langTagsList.appendChild(tag);
        });
    }

    function processLanguageFilter() {
        const mode = langModeSelect.value;

        if (mode === 'single') {
            const val = langSingleInput.value.trim();
            return { languageParam: val || null, queryExtra: null };
        }

        if (mode === 'multi') {
            if (selectedLanguages.length === 0) return { languageParam: null, queryExtra: null };

            const op = langOperatorSelect.value;
            if (op === 'OR') {
                const expr = selectedLanguages.map(l => `language:${l}`).join(' OR ');
                return { languageParam: null, queryExtra: `(${expr})` };
            }
            if (op === 'AND') {
                const expr = selectedLanguages.map(l => `language:${l}`).join(' ');
                return { languageParam: null, queryExtra: expr };
            }
            if (op === 'NOT') {
                const expr = selectedLanguages.map(l => `-language:${l}`).join(' ');
                return { languageParam: null, queryExtra: expr };
            }
        }

        if (mode === 'raw') {
            const raw = pushedLangRaw.value.trim();
            return { languageParam: null, queryExtra: raw || null };
        }

        return { languageParam: null, queryExtra: null };
    }

    // LOGIQUE ÉTOILES
    const starsModeSelect = document.getElementById('stars-mode-select');
    const starsControlsContainer = document.getElementById('stars-controls-container');
    const starsModeMin = document.getElementById('stars-mode-min');
    const starsModeRange = document.getElementById('stars-mode-range');
    const starsModeRaw = document.getElementById('stars-mode-raw');
    const starsMinInput = document.getElementById('stars-min-input');
    const starsRangeMin = document.getElementById('stars-range-min');
    const starsRangeMax = document.getElementById('stars-range-max');
    const starsRawInput = document.getElementById('stars-raw-input');

    if (starsModeSelect) {
        starsModeSelect.addEventListener('change', () => {
            const mode = starsModeSelect.value;
            if (mode === 'none') {
                starsControlsContainer.classList.add('hidden');
                return;
            }
            starsControlsContainer.classList.remove('hidden');
            starsModeMin.classList.toggle('hidden', mode !== 'min');
            starsModeRange.classList.toggle('hidden', mode !== 'range');
            starsModeRaw.classList.toggle('hidden', mode !== 'raw');
        });
    }

    function buildStarsParam() {
        const mode = starsModeSelect.value;
        if (mode === 'min') {
            const min = starsMinInput.value.trim();
            return min ? `>=${min}` : null;
        }
        if (mode === 'range') {
            const min = starsRangeMin.value.trim();
            const max = starsRangeMax.value.trim();
            if (min && max) return `${min}..${max}`;
            if (min) return `>=${min}`;
            if (max) return `<=${max}`;
            return null;
        }
        if (mode === 'raw') {
            return starsRawInput.value.trim() || null;
        }
        return null;
    }

    // LOGIQUE DATES
    const pushedModeSelect = document.getElementById('pushed-mode-select');
    const dateControlsContainer = document.getElementById('date-controls-container');
    const modeSingle = document.getElementById('mode-single');
    const modeRange = document.getElementById('mode-range');
    const modeRelative = document.getElementById('mode-relative');
    const modeRaw = document.getElementById('mode-raw');

    const pushedOpSelect = document.getElementById('pushed-op-select');
    const pushedDateInput = document.getElementById('pushed-date-input');
    const pushedStartOp = document.getElementById('pushed-start-op');
    const pushedStartDate = document.getElementById('pushed-start-date');
    const pushedEndOp = document.getElementById('pushed-end-op');
    const pushedEndDate = document.getElementById('pushed-end-date');
    const pushedRelativeSelect = document.getElementById('pushed-relative-select');
    const pushedRawInput = document.getElementById('pushed-raw-input');

    const paginationDiv = document.getElementById('pagination');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const jumpForm = document.getElementById('jump-form');
    const pageInput = document.getElementById('page-input');
    const maxPageInfo = document.getElementById('max-page-info');
    const jumpBtn = document.getElementById('jump-btn');

    function updateOrderState() {
        orderSelect.disabled = (sortSelect.value === '');
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', updateOrderState);
    }

    if (pushedModeSelect) {
        pushedModeSelect.addEventListener('change', () => {
            const mode = pushedModeSelect.value;
            if (mode === 'none') {
                dateControlsContainer.classList.add('hidden');
                return;
            }
            dateControlsContainer.classList.remove('hidden');
            modeSingle.classList.toggle('hidden', mode !== 'single');
            modeRange.classList.toggle('hidden', mode !== 'range');
            modeRelative.classList.toggle('hidden', mode !== 'relative');
            modeRaw.classList.toggle('hidden', mode !== 'raw');
        });
    }

    function getRelativeDate(preset) {
        const now = new Date();
        if (preset === '7d') now.setDate(now.getDate() - 7);
        else if (preset === '30d') now.setDate(now.getDate() - 30);
        else if (preset === '90d') now.setDate(now.getDate() - 90);
        else if (preset === '1y') now.setFullYear(now.getFullYear() - 1);
        else if (preset === 'this-year') return `${now.getFullYear()}-01-01`;

        return now.toISOString().split('T')[0];
    }

    function buildPushedParam() {
        const mode = pushedModeSelect.value;

        if (mode === 'single') {
            const date = pushedDateInput.value;
            return date ? `${pushedOpSelect.value}${date}` : null;
        }

        if (mode === 'range') {
            const start = pushedStartDate.value;
            const end = pushedEndDate.value;
            if (start && end) {
                if (pushedStartOp.value === '>=' && pushedEndOp.value === '<=') {
                    return `${start}..${end}`;
                }
                return `${pushedStartOp.value}${start} ${pushedEndOp.value}${end}`;
            }
            if (start) return `${pushedStartOp.value}${start}`;
            if (end) return `${pushedEndOp.value}${end}`;
            return null;
        }

        if (mode === 'relative') {
            const startDate = getRelativeDate(pushedRelativeSelect.value);
            return `>=${startDate}`;
        }

        if (mode === 'raw') {
            return pushedRawInput.value.trim() || null;
        }

        return null;
    }

    // ÉVÉNEMENTS & REQUÊTE HTTP
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = input.value.trim();
            if (query) {
                currentQuery = query;
                currentPage = 1;
                fetchResults(query, 1);
            }
        });
    }

    if (jumpForm) {
        jumpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const targetPage = parseInt(pageInput.value, 10);
            if (targetPage >= 1 && targetPage <= maxPages && targetPage !== currentPage) {
                fetchResults(currentQuery, targetPage);
            }
        });
    }

    async function fetchResults(query, page) {
        setLoading(true);
        statusDiv.textContent = `Vérification HTTP en cours pour la page ${page}...`;
        resultsUl.innerHTML = '';

        const params = new URLSearchParams();

        const langResult = processLanguageFilter();
        let finalQuery = query;

        if (langResult.queryExtra) {
            finalQuery += ` ${langResult.queryExtra}`;
        }

        params.append('q', finalQuery);
        params.append('page', page);
        params.append('per_page', perPageSelect.value);

        if (langResult.languageParam) {
            params.append('language', langResult.languageParam);
        }

        if (sortSelect.value) {
            params.append('sort', sortSelect.value);
            if (orderSelect.value) {
                params.append('order', orderSelect.value);
            }
        }

        const starsVal = buildStarsParam();
        if (starsVal) {
            params.append('stars', starsVal);
        }

        const pushedVal = buildPushedParam();
        if (pushedVal) {
            params.append('pushed', pushedVal);
        }

        try {
            const response = await fetch(`${API_BASE_URL}?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Erreur serveur : ${response.status}`);
            }

            const data = await response.json();
            currentPage = data.current_page;
            maxPages = data.total_pages;

            displayResults(data.pages_urls);
            setupPagination(data);

        } catch (err) {
            statusDiv.textContent = `Erreur : Impossible de contacter l'API (${err.message})`;
            paginationDiv.classList.add('hidden');
        } finally {
            setLoading(false);
        }
    }

    function displayResults(urls) {
        resultsUl.innerHTML = '';

        if (!urls || urls.length === 0) {
            statusDiv.textContent = 'Aucun domaine fonctionnel trouvé pour cette page.';
            return;
        }

        statusDiv.textContent = `${urls.length} site(s) fonctionnel(s) trouvé(s) sur cette page :`;

        urls.forEach(url => {
            const li = document.createElement('li');
            li.className = 'result-item';

            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = url;

            li.appendChild(a);
            resultsUl.appendChild(li);
        });
    }

    function setupPagination(data) {
        if (data.total_pages <= 1 && (!data.pages_urls || data.pages_urls.length === 0)) {
            paginationDiv.classList.add('hidden');
            return;
        }

        paginationDiv.classList.remove('hidden');

        pageInput.value = data.current_page;
        pageInput.max = data.total_pages;
        maxPageInfo.textContent = `sur ${data.total_pages} (${data.total_results} dépôts au total)`;

        prevBtn.disabled = !data.prev_page;
        nextBtn.disabled = !data.next_page;

        prevBtn.onclick = () => {
            if (data.prev_page) fetchResults(currentQuery, data.prev_page);
        };

        nextBtn.onclick = () => {
            if (data.next_page) fetchResults(currentQuery, data.next_page);
        };
    }

    function setLoading(isLoading) {
        searchBtn.disabled = isLoading;
        input.disabled = isLoading;
        prevBtn.disabled = isLoading;
        nextBtn.disabled = isLoading;
        jumpBtn.disabled = isLoading;
        pageInput.disabled = isLoading;

        sortSelect.disabled = isLoading;
        perPageSelect.disabled = isLoading;

        langModeSelect.disabled = isLoading;
        langSingleInput.disabled = isLoading;
        langOperatorSelect.disabled = isLoading;
        langMultiInput.disabled = isLoading;
        addLangBtn.disabled = isLoading;
        pushedLangRaw.disabled = isLoading;

        starsModeSelect.disabled = isLoading;
        starsMinInput.disabled = isLoading;
        starsRangeMin.disabled = isLoading;
        starsRangeMax.disabled = isLoading;
        starsRawInput.disabled = isLoading;

        pushedModeSelect.disabled = isLoading;
        pushedOpSelect.disabled = isLoading;
        pushedDateInput.disabled = isLoading;
        pushedStartOp.disabled = isLoading;
        pushedStartDate.disabled = isLoading;
        pushedEndOp.disabled = isLoading;
        pushedEndDate.disabled = isLoading;
        pushedRelativeSelect.disabled = isLoading;
        pushedRawInput.disabled = isLoading;

        if (isLoading) {
            orderSelect.disabled = true;
            searchBtn.textContent = 'Chargement...';
        } else {
            updateOrderState();
            searchBtn.textContent = 'Chercher';
        }
    }
});