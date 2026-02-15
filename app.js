(function () {
    'use strict';

    const ICONS = {
        'mountain': '<svg viewBox="0 0 24 24"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
        'droplets': '<svg viewBox="0 0 24 24"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 14.69c1.34 0 2.44-1.12 2.44-2.48 0-.71-.35-1.38-1.05-1.95S12.78 9 12.56 8.11c-.17.89-.69 1.73-1.39 2.3S10.12 11.5 10.12 12.21c0 1.36 1.1 2.48 2.44 2.48z"/></svg>',
        'snowflake': '<svg viewBox="0 0 24 24"><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>',
        'waves': '<svg viewBox="0 0 24 24"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>',
        'droplet': '<svg viewBox="0 0 24 24"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',
        'flame': '<svg viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
        'cpu': '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
        'globe': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        'star': '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    };

    const BATCH_SIZE = 60;
    let papersData = null;
    let currentCategory = 'all';
    let currentYear = null;
    let displayedCount = 0;
    const selectedPapers = new Set();

    async function init() {
        try {
            const resp = await fetch('papers.json');
            papersData = await resp.json();
        } catch (e) {
            console.error('Failed to load papers.json:', e);
            return;
        }
        renderStats();
        renderTabs();
        renderTimeline();
        renderPapers();
        setupEventListeners();
    }

    function getFilteredPapers() {
        let papers = papersData.papers;
        if (currentCategory !== 'all') {
            papers = papers.filter(p => p.category === currentCategory);
        }
        if (currentYear !== null) {
            papers = papers.filter(p => p.year === currentYear);
        }
        return papers;
    }

    function renderStats() {
        document.getElementById('total-count').textContent = papersData.meta.totalPapers;
        const [minY, maxY] = papersData.meta.yearRange;
        document.getElementById('year-range').textContent = `${minY}–${maxY}`;
    }

    function renderTabs() {
        const container = document.getElementById('category-tabs');
        const allCount = papersData.papers.length;

        let html = `<button class="tab active" data-category="all" style="--tab-color: var(--accent)">
            <span class="tab-icon">${ICONS['star']}</span>
            <span class="tab-label">All</span>
            <span class="tab-count">${allCount}</span>
        </button>`;

        papersData.categories.forEach(cat => {
            html += `<button class="tab" data-category="${cat.key}" style="--tab-color: ${cat.color}">
                <span class="tab-icon">${ICONS[cat.icon] || ICONS['globe']}</span>
                <span class="tab-label">${cat.name}</span>
                <span class="tab-count">${cat.count}</span>
            </button>`;
        });

        container.innerHTML = html;
    }

    function renderTimeline() {
        const track = document.getElementById('timeline-track');
        const yearCounts = {};

        papersData.papers.forEach(p => {
            if (!p.year) return;
            yearCounts[p.year] = (yearCounts[p.year] || 0) + 1;
        });

        const years = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
        const maxCount = Math.max(...Object.values(yearCounts));
        const maxBarH = 50;

        let html = '';
        years.forEach(year => {
            const count = yearCounts[year];
            const h = Math.max(4, (count / maxCount) * maxBarH);
            html += `<div class="timeline-bar" data-year="${year}" title="${year}: ${count} papers">
                <div class="bar-fill" style="height:${h}px"></div>
                <span class="bar-year">${year}</span>
            </div>`;
        });

        track.innerHTML = html;
    }

    function updateTimelineForCategory() {
        const bars = document.querySelectorAll('.timeline-bar');
        const yearCounts = {};

        const papers = currentCategory === 'all'
            ? papersData.papers
            : papersData.papers.filter(p => p.category === currentCategory);

        papers.forEach(p => {
            if (!p.year) return;
            yearCounts[p.year] = (yearCounts[p.year] || 0) + 1;
        });

        const maxCount = Math.max(...Object.values(yearCounts), 1);
        const maxBarH = 50;

        bars.forEach(bar => {
            const year = parseInt(bar.dataset.year);
            const count = yearCounts[year] || 0;
            const fill = bar.querySelector('.bar-fill');
            if (count === 0) {
                fill.style.height = '2px';
                fill.style.opacity = '0.15';
            } else {
                const h = Math.max(4, (count / maxCount) * maxBarH);
                fill.style.height = h + 'px';
                fill.style.opacity = '';
            }
            bar.title = `${year}: ${count} papers`;
        });
    }

    function renderPapers() {
        const grid = document.getElementById('papers-grid');
        grid.innerHTML = '';
        displayedCount = 0;

        const filtered = getFilteredPapers();
        updateFilterInfo(filtered.length);
        loadMorePapers(filtered);
    }

    function loadMorePapers(filtered) {
        if (!filtered) filtered = getFilteredPapers();

        const grid = document.getElementById('papers-grid');
        const batch = filtered.slice(displayedCount, displayedCount + BATCH_SIZE);

        batch.forEach((paper, i) => {
            const card = createPaperCard(paper, displayedCount + i);
            grid.appendChild(card);
        });

        displayedCount += batch.length;

        const container = document.getElementById('load-more-container');
        const info = document.getElementById('load-more-info');

        if (displayedCount < filtered.length) {
            container.classList.add('visible');
            info.textContent = `Showing ${displayedCount} of ${filtered.length} papers`;
        } else {
            container.classList.remove('visible');
        }
    }

    function createPaperCard(paper, index) {
        const cat = papersData.categories.find(c => c.key === paper.category);
        const color = cat ? cat.color : '#6b7280';
        const catName = cat ? cat.name : 'Other';
        const catIcon = cat ? (ICONS[cat.icon] || '') : '';

        const card = document.createElement('div');
        card.className = 'paper-card' + (selectedPapers.has(paper.id) ? ' selected' : '');
        card.style.setProperty('--card-color', color);
        card.style.animationDelay = `${Math.min((index % BATCH_SIZE) * 0.03, 0.5)}s`;
        card.dataset.paperId = paper.id;

        const authorsStr = paper.authors.slice(0, 3).join(', ')
            + (paper.authors.length > 3 ? ` +${paper.authors.length - 3}` : '');

        const isChecked = selectedPapers.has(paper.id);

        card.innerHTML = `
            <button class="card-checkbox${isChecked ? ' checked' : ''}" aria-label="Select paper">✓</button>
            <div class="card-header">
                <span class="card-category">${catIcon} ${catName}</span>
                <span class="card-year">${paper.year}</span>
            </div>
            <h3 class="card-title">${escapeHtml(paper.title)}</h3>
            <p class="card-authors">${escapeHtml(authorsStr)}</p>
            <p class="card-journal">${escapeHtml(paper.journal)}</p>
        `;

        const checkbox = card.querySelector('.card-checkbox');
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePaperSelection(paper.id, card, checkbox);
        });

        card.addEventListener('click', () => openModal(paper));
        return card;
    }

    function togglePaperSelection(paperId, card, checkbox) {
        if (selectedPapers.has(paperId)) {
            selectedPapers.delete(paperId);
            card.classList.remove('selected');
            checkbox.classList.remove('checked');
        } else {
            selectedPapers.add(paperId);
            card.classList.add('selected');
            checkbox.classList.add('checked');
        }
        updateSelectionCount();
    }

    function updateSelectionCount() {
        const el = document.getElementById('selection-count');
        if (selectedPapers.size > 0) {
            el.textContent = selectedPapers.size;
            el.classList.add('visible');
        } else {
            el.classList.remove('visible');
        }
    }

    function selectAllFiltered() {
        const filtered = getFilteredPapers();
        filtered.forEach(p => selectedPapers.add(p.id));
        document.querySelectorAll('.paper-card').forEach(card => {
            card.classList.add('selected');
            const cb = card.querySelector('.card-checkbox');
            if (cb) cb.classList.add('checked');
        });
        updateSelectionCount();
    }

    function clearSelection() {
        selectedPapers.clear();
        document.querySelectorAll('.paper-card').forEach(card => {
            card.classList.remove('selected');
            const cb = card.querySelector('.card-checkbox');
            if (cb) cb.classList.remove('checked');
        });
        updateSelectionCount();
    }

    function openModal(paper) {
        const modal = document.getElementById('paper-modal');
        const cat = papersData.categories.find(c => c.key === paper.category);
        const color = cat ? cat.color : '#6b7280';
        const catName = cat ? cat.name : 'Other';
        const catIcon = cat ? (ICONS[cat.icon] || '') : '';

        const modalCat = document.getElementById('modal-category');
        modalCat.innerHTML = `${catIcon} ${catName}`;
        modalCat.style.background = `color-mix(in srgb, ${color} 15%, transparent)`;
        modalCat.style.color = color;

        document.getElementById('modal-year').textContent = paper.year;
        document.getElementById('modal-title').textContent = paper.title;
        document.getElementById('modal-authors').textContent = paper.authors.join(', ');
        document.getElementById('modal-journal').textContent = paper.journal;

        const summarySection = document.getElementById('modal-summary-section');
        const summaryEl = document.getElementById('modal-summary');
        if (paper.summary && paper.summary.trim()) {
            summarySection.style.display = '';
            summaryEl.textContent = paper.summary;
        } else {
            summarySection.style.display = 'none';
        }

        const doiLink = document.getElementById('modal-doi-link');
        if (paper.url) {
            doiLink.href = paper.url;
            doiLink.style.display = '';
        } else {
            doiLink.style.display = 'none';
        }

        const ssLink = document.getElementById('modal-ss-link');
        if (paper.semanticScholarId) {
            ssLink.href = `https://www.semanticscholar.org/paper/${paper.semanticScholarId}`;
            ssLink.style.display = '';
        } else {
            ssLink.style.display = 'none';
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        document.getElementById('paper-modal').classList.remove('open');
        document.body.style.overflow = '';
    }

    function updateFilterInfo(count) {
        const el = document.getElementById('filter-info');
        const parts = [];

        if (currentCategory !== 'all') {
            const cat = papersData.categories.find(c => c.key === currentCategory);
            parts.push(cat ? cat.name : currentCategory);
        }
        if (currentYear !== null) {
            parts.push(String(currentYear));
        }

        if (parts.length > 0) {
            el.innerHTML = `Showing <strong>${count}</strong> papers filtered by: ${parts.join(' · ')}
                <button class="clear-filter" id="clear-filter-btn">Clear filters</button>`;
            el.classList.add('visible');
        } else {
            el.classList.remove('visible');
        }
    }

    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function exportJSON() {
        const papers = selectedPapers.size > 0
            ? papersData.papers.filter(p => selectedPapers.has(p.id))
            : getFilteredPapers();
        const suffix = selectedPapers.size > 0 ? 'selected' : (currentCategory === 'all' ? 'all' : currentCategory);
        const filename = `envseis_${suffix}_papers.json`;
        downloadFile(JSON.stringify(papers, null, 2), filename, 'application/json');
    }

    function exportCSV() {
        const papers = selectedPapers.size > 0
            ? papersData.papers.filter(p => selectedPapers.has(p.id))
            : getFilteredPapers();
        const suffix = selectedPapers.size > 0 ? 'selected' : (currentCategory === 'all' ? 'all' : currentCategory);
        const filename = `envseis_${suffix}_papers.csv`;

        const headers = ['id', 'title', 'authors', 'year', 'category', 'journal', 'doi', 'url', 'abstract', 'summary', 'citationCount'];
        const csvRows = [headers.join(',')];

        papers.forEach(p => {
            const row = headers.map(h => {
                let val = p[h];
                if (h === 'authors') val = (val || []).join('; ');
                if (val === null || val === undefined) val = '';
                val = String(val).replace(/"/g, '""');
                return `"${val}"`;
            });
            csvRows.push(row.join(','));
        });

        downloadFile(csvRows.join('\n'), filename, 'text/csv');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function setupEventListeners() {
        document.getElementById('category-tabs').addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            if (!tab) return;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            currentYear = null;
            document.querySelectorAll('.timeline-bar').forEach(b => b.classList.remove('active'));
            updateTimelineForCategory();
            renderPapers();
        });

        document.getElementById('timeline-toggle').addEventListener('click', () => {
            document.querySelector('.timeline-section').classList.toggle('open');
        });

        document.getElementById('timeline-track').addEventListener('click', (e) => {
            const bar = e.target.closest('.timeline-bar');
            if (!bar) return;
            const year = parseInt(bar.dataset.year);

            if (currentYear === year) {
                currentYear = null;
                bar.classList.remove('active');
            } else {
                document.querySelectorAll('.timeline-bar').forEach(b => b.classList.remove('active'));
                bar.classList.add('active');
                currentYear = year;
            }
            renderPapers();
        });

        document.getElementById('download-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('download-dropdown').classList.toggle('open');
        });

        document.querySelectorAll('.dropdown-item[data-format]').forEach(item => {
            item.addEventListener('click', () => {
                const format = item.dataset.format;
                if (format === 'json') exportJSON();
                else if (format === 'csv') exportCSV();
                document.getElementById('download-dropdown').classList.remove('open');
            });
        });

        document.getElementById('select-all-btn').addEventListener('click', () => {
            selectAllFiltered();
            document.getElementById('download-dropdown').classList.remove('open');
        });

        document.getElementById('clear-selection-btn').addEventListener('click', () => {
            clearSelection();
            document.getElementById('download-dropdown').classList.remove('open');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#download-dropdown')) {
                document.getElementById('download-dropdown').classList.remove('open');
            }
        });

        document.getElementById('load-more-btn').addEventListener('click', () => {
            loadMorePapers();
        });

        document.querySelector('.modal-close').addEventListener('click', closeModal);
        document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        document.getElementById('filter-info').addEventListener('click', (e) => {
            if (e.target.id === 'clear-filter-btn') {
                currentCategory = 'all';
                currentYear = null;
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelector('.tab[data-category="all"]').classList.add('active');
                document.querySelectorAll('.timeline-bar').forEach(b => b.classList.remove('active'));
                updateTimelineForCategory();
                renderPapers();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
