// github-search/ui.js

export function renderSignatureTags(activeSignatures, containerId, removeCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    activeSignatures.forEach((sig, index) => {
        let prefix = '';
        if (sig.operator === 'NOT') prefix = 'NOT ';
        if (sig.operator === 'OR') prefix = 'OU ';

        const tag = document.createElement('div');
        tag.className = 'lang-tag';
        tag.innerHTML = `
            <span><strong>${prefix}</strong>${sig.value}</span>
            <span class="remove-tag">&times;</span>
        `;
        tag.querySelector('.remove-tag').addEventListener('click', () => removeCallback(index));
        container.appendChild(tag);
    });
}

export function renderLangTags(selectedLanguages, containerId, removeCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    selectedLanguages.forEach((item, index) => {
        let prefix = item.operator === 'OR' ? 'OU ' : 'ET ';
        const tag = document.createElement('div');
        tag.className = 'lang-tag';
        tag.innerHTML = `
            <span><strong>${prefix}</strong>${item.lang}</span>
            <span class="remove-tag">&times;</span>
        `;
        tag.querySelector('.remove-tag').addEventListener('click', () => removeCallback(index));
        container.appendChild(tag);
    });
}

export function displayResults(urls, resultsUl, statusDiv) {
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

export function setupPagination(data, onPageChange) {
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

    prevBtn.onclick = () => { if (data.prev_page) onPageChange(data.prev_page); };
    nextBtn.onclick = () => { if (data.next_page) onPageChange(data.next_page); };
}

export function setLoading(isLoading, searchBtn) {
    searchBtn.disabled = isLoading;
    searchBtn.textContent = isLoading ? 'Chargement...' : 'Chercher';
}