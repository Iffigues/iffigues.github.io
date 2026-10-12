// github-search/filters.js

export function processSignaturesFilter(activeSignatures, techSignatureInput) {
    if (techSignatureInput && techSignatureInput.value.trim()) {
        const val = techSignatureInput.value.trim();
        activeSignatures.push({ value: val, operator: 'AND' });
        techSignatureInput.value = '';
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

export function processLanguageFilter(langModeSelect, langSingleInput, selectedLanguages, pushedLangRaw) {
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

export function buildStarsParam(starsModeSelect, starsMinInput, starsRangeMin, starsRangeMax, starsRawInput) {
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

export function buildPushedParam(pushedModeSelect) {
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