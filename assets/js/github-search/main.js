// github-search/main.js

import { state } from './state.js';
import { processSignaturesFilter, processLanguageFilter, buildStarsParam, buildPushedParam } from './filters.js';
import { searchRepositories } from './api.js';
import { renderSignatureTags, renderLangTags, displayResults, setupPagination, setLoading } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('query-input');
    const searchBtn = document.getElementById('search-btn');
    const statusDiv = document.getElementById('status');
    const resultsUl = document.getElementById('results');
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

    // Éléments spécifiques
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

    // Signatures
    const techSignatureInput = document.getElementById('tech-signature-input');
    const techOperatorSelect = document.getElementById('tech-operator-select');
    const addSignatureBtn = document.getElementById('add-signature-btn');

    function handleAddSignature() {
        const val = techSignatureInput.value.trim();
        if (!val) return;
        const op = techOperatorSelect ? techOperatorSelect.value : 'AND';
        state.activeSignatures.push({ value: val, operator: op });
        renderSignatureTags(state.activeSignatures, 'signatures-tags-list', (idx) => {
            state.activeSignatures.splice(idx, 1);
            renderSignatureTags(state.activeSignatures, 'signatures-tags-list', arguments.callee);
        });
        techSignatureInput.value = '';
    }

    if (addSignatureBtn && techSignatureInput) {
        addSignatureBtn.addEventListener('click', handleAddSignature);
        techSignatureInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleAddSignature(); }
        });
    }

    // Langages
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

    function handleAddLanguage() {
        const val = langMultiInput.value.trim().toLowerCase();
        if (val) {
            const op = langOperatorSelect.value;
            const exists = state.selectedLanguages.some(l => l.lang === val && l.operator === op);
            if (!exists) {
                state.selectedLanguages.push({ lang: val, operator: op });
                renderLangTags(state.selectedLanguages, 'lang-tags-list', (idx) => {
                    state.selectedLanguages.splice(idx, 1);
                });
                langMultiInput.value = '';
            }
        }
    }

    if (addLangBtn && langMultiInput) {
        addLangBtn.addEventListener('click', handleAddLanguage);
        langMultiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleAddLanguage(); }
        });
    }

    // Étoiles & Dates toggles
    const starsModeSelect = document.getElementById('stars-mode-select');
    const starsControlsContainer = document.getElementById('stars-controls-container');
    starsModeSelect.addEventListener('change', () => {
        starsControlsContainer.classList.toggle('hidden', starsModeSelect.value === 'none');
        document.getElementById('stars-mode-min').classList.toggle('hidden', starsModeSelect.value !== 'min');
        document.getElementById('stars-mode-range').classList.toggle('hidden', starsModeSelect.value !== 'range');
        document.getElementById('stars-mode-raw').classList.toggle('hidden', starsModeSelect.value !== 'raw');
    });

    const pushedModeSelect = document.getElementById('pushed-mode-select');
    const dateControlsContainer = document.getElementById('date-controls-container');
    pushedModeSelect.addEventListener('change', () => {
        const mode = pushedModeSelect.value;
        dateControlsContainer.classList.toggle('hidden', mode === 'none');
        document.getElementById('mode-single').classList.toggle('hidden', mode !== 'single');
        document.getElementById('mode-range').classList.toggle('hidden', mode !== 'range');
        document.getElementById('mode-relative').classList.toggle('hidden', mode !== 'relative');
        document.getElementById('mode-raw').classList.toggle('hidden', mode !== 'raw');
    });

    sortSelect.addEventListener('change', () => {
        orderSelect.disabled = (sortSelect.value === '');
    });

    // Exécution de la recherche principale
    async function executeSearch(query, page) {
        setLoading(true, searchBtn);
        statusDiv.textContent = `Recherche en cours pour la page ${page}...`;
        resultsUl.innerHTML = '';

        const params = new URLSearchParams();
        let finalQueryParts = [];

        if (query) finalQueryParts.push(query);

        const selectedInFields = Array.from(document.querySelectorAll('.in-field-checkbox:checked')).map(cb => cb.value);
        if (selectedInFields.length > 0 && selectedInFields.length < 3) {
            finalQueryParts.push(`in:${selectedInFields.join(',')}`);
        }

        const signaturesExtra = processSignaturesFilter(state.activeSignatures, techSignatureInput);
        if (signaturesExtra) finalQueryParts.push(signaturesExtra);

        const langResult = processLanguageFilter(langModeSelect, langSingleInput, state.selectedLanguages, pushedLangRaw);
        if (langResult.queryExtra) finalQueryParts.push(langResult.queryExtra);

        if (createdDateInput.value.trim()) finalQueryParts.push(`created:${createdDateInput.value.trim()}`);
        if (locationInput.value.trim()) finalQueryParts.push(`location:${locationInput.value.trim()}`);
        if (forksCountInput.value.trim()) finalQueryParts.push(`forks:${forksCountInput.value.trim()}`);

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

        const starsVal = buildStarsParam(starsModeSelect, document.getElementById('stars-min-input'), document.getElementById('stars-range-min'), document.getElementById('stars-range-max'), document.getElementById('stars-raw-input'));
        if (starsVal) params.append('stars', starsVal);

        const pushedVal = buildPushedParam(pushedModeSelect);
        if (pushedVal) params.append('pushed', pushedVal);

        try {
            const data = await searchRepositories(params);
            state.currentPage = data.current_page || page;
            state.maxPages = data.total_pages || 1;

            displayResults(data.pages_urls || data.items || [], resultsUl, statusDiv);
            setupPagination(data, (newPage) => executeSearch(state.currentQuery, newPage));
        } catch (err) {
            statusDiv.textContent = `Erreur : Impossible de contacter l'API (${err.message})`;
            document.getElementById('pagination').classList.add('hidden');
        } finally {
            setLoading(false, searchBtn);
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        state.currentQuery = input.value.trim();
        state.currentPage = 1;
        executeSearch(state.currentQuery, 1);
    });

    if (jumpForm) {
        jumpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pageInput = document.getElementById('page-input');
            const pageNumber = parseInt(pageInput.value, 10);
            if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= state.maxPages) {
                executeSearch(state.currentQuery, pageNumber);
            }
        });
    }
});