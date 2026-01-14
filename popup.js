document.addEventListener('DOMContentLoaded', async () => {
    // --- Elements ---
    const startDateEl = document.getElementById('startDate');
    const endDateEl = document.getElementById('endDate');
    const excludeMultiEl = document.getElementById('excludeMulti');
    const userListEl = document.getElementById('userList');
    const selectedCountEl = document.getElementById('selectedCount');
    const runBtn = document.getElementById('runFilterBtn');
    const refreshBtn = document.getElementById('refreshUsersBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const resultsSection = document.getElementById('resultsSection');
    const resultsTableBody = document.querySelector('#resultsTable tbody');
    const copyBtn = document.getElementById('copyBtn');
    const medianDisplay = document.getElementById('medianDisplay');

    // --- State ---
    let users = [];
    let results = [];
    let isRunning = false;
    let currentSort = { key: 'count', dir: 'desc' }; // default sort

    // --- Initialization ---
    initDates();
    await loadUsers();
    restoreSelection();

    // --- Event Listeners ---
    refreshBtn.addEventListener('click', async () => {
        userListEl.innerHTML = '<div class="loading-spinner">Reloading...</div>';
        await loadUsers(true);
        restoreSelection();
    });

    userListEl.addEventListener('change', (e) => {
        if (e.target.matches('input[type="checkbox"]')) {
            updateSelectedCount();
            saveSelection();
        }
    });

    excludeMultiEl.addEventListener('change', () => {
        chrome.storage.local.set({ excludeMulti: excludeMultiEl.checked });
    });

    runBtn.addEventListener('click', startFiltration);
    copyBtn.addEventListener('click', copyTableToClipboard);

    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            if (currentSort.key === key) {
                // toggle direction
                currentSort.dir = currentSort.dir === 'desc' ? 'asc' : 'desc';
            } else {
                currentSort.key = key;
                currentSort.dir = 'desc';
            }
            updateSortIcons();
            renderTable();
        });
    });

    // --- Functions ---

function initDates() {
    const now = new Date();
    
    // Use Date.UTC to define the specific moment 
    // This creates a date at midnight UTC on the 1st
    const firstDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    
    // The "0" trick still works perfectly with UTC
    const lastDay = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));

    startDateEl.valueAsDate = firstDay;
    endDateEl.valueAsDate = lastDay;
}


    async function loadUsers(forceFetch = false) {
        try {
            // Check storage first if not forced
            if (!forceFetch) {
                const stored = await chrome.storage.local.get(['cachedUsers']);
                if (stored.cachedUsers && Array.isArray(stored.cachedUsers)) {
                    users = stored.cachedUsers;
                    renderUserList();
                    return;
                }
            }

            // Fetch from API
            const response = await fetch('https://app.browswave.com/iui-api/nats/get-activity-filters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'bw-dev-environment': 'production'
                }
            });

            if (!response.ok) throw new Error('Network error');
            const json = await response.json();
            
            // Extract users from json data -> users
            if (json.data && Array.isArray(json.data.users)) {
                users = json.data.users;
                // Cache them
                chrome.storage.local.set({ cachedUsers: users });
                renderUserList();
            } else {
                userListEl.innerHTML = '<div style="padding:10px; color:#ff5252">Invalid data format received.</div>';
            }

        } catch (error) {
            console.error(error);
            userListEl.innerHTML = '<div style="padding:10px; color:#ff5252">Error loading users. Check connection.</div>';
        }
    }

    function renderUserList() {
        userListEl.innerHTML = '';
        if (users.length === 0) {
            userListEl.innerHTML = '<div style="padding:10px;">No users found.</div>';
            return;
        }

        users.forEach(u => {
            const email = u.email || 'Unknown';
            const div = document.createElement('div');
            div.className = 'user-item';
            div.innerHTML = `
                <label style="flex-direction:row; color:var(--text-main); cursor:pointer; align-items:center; width:100%">
                    <input type="checkbox" value="${email}">
                    ${email}
                </label>
            `;
            userListEl.appendChild(div);
        });
        updateSelectedCount();
    }

    async function restoreSelection() {
        const stored = await chrome.storage.local.get(['selectedEmails', 'excludeMulti']);
        
        if (stored.excludeMulti !== undefined) {
            excludeMultiEl.checked = stored.excludeMulti;
        }

        if (stored.selectedEmails && Array.isArray(stored.selectedEmails)) {
            const checkboxes = userListEl.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                if (stored.selectedEmails.includes(cb.value)) {
                    cb.checked = true;
                }
            });
            updateSelectedCount();
        }
    }

    function saveSelection() {
        const checkboxes = userListEl.querySelectorAll('input[type="checkbox"]:checked');
        const selected = Array.from(checkboxes).map(cb => cb.value);
        chrome.storage.local.set({ selectedEmails: selected });
    }

    function updateSelectedCount() {
        const count = userListEl.querySelectorAll('input[type="checkbox"]:checked').length;
        selectedCountEl.textContent = `(${count})`;
    }

    async function startFiltration() {
        if (isRunning) return;

        const selectedCheckboxes = Array.from(userListEl.querySelectorAll('input[type="checkbox"]:checked'));
        if (selectedCheckboxes.length === 0) {
            alert('Please select at least one user.');
            return;
        }

        // UI Reset
        isRunning = true;
        runBtn.disabled = true;
        resultsSection.classList.add('hidden');
        progressContainer.classList.remove('hidden');
        resultsTableBody.innerHTML = '';
        results = [];

        const startDate = startDateEl.value; // YYYY-MM-DD
        const endDate = endDateEl.value;     // YYYY-MM-DD
        const excludeMulti = excludeMultiEl.checked;
        const total = selectedCheckboxes.length;

        // Base query string construction
        let baseQuery = `created_at:[${startDate} TO ${endDate}]`;
        if (excludeMulti) {
            baseQuery += ' AND package:SINGLE';
        }

        for (let i = 0; i < total; i++) {
            const userEmail = selectedCheckboxes[i].value;
            
            // Update Progress
            progressText.textContent = `${i + 1}/${total} - ${userEmail}`;
            progressFill.style.width = `${((i + 1) / total) * 100}%`;

            // Wait 1000ms BEFORE filtration (as requested)
            await new Promise(r => setTimeout(r, 1000));

            // Construct Filters
            const userQuery = `${baseQuery} AND created_by:"${userEmail}"`;
            
            const filterPayload = {
                "query_string": userQuery,
                "ids": [],
                "path": [],
                "title": "",
                "ean": "",
                "part_number": "",
                "category": [],
                "schemas": [],
                "components": []
            };

            const requestPayload = {
                "command": "clusters.filter",
                "payload": {
                    "filter": filterPayload,
                    "page": { "page": 1, "items": 1 },
                    "sort_by": []
                },
                "timeout": 30000
            };

            try {
                const res = await fetch('https://app.browswave.com/iui-api/nats', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'bw-dev-environment': 'production'
                    },
                    body: JSON.stringify(requestPayload)
                });

                if (res.ok) {
                    const data = await res.json();
                    // Extract count. Assuming structure data -> count based on prompt description
                    // (Prompt: "From the response we use only data.count")
                    // Note: API responses might be wrapped. Usually response.data.count or similar.
                    // Based on "return json data", let's assume root.data.count or root.count. 
                    // Most NATS bridges return {data: { count: 123, ... }} or just {count: 123}.
                    // I will check for data.count safely.
                    
                    const count = data.data && typeof data.data.count !== 'undefined' ? data.data.count : (typeof data.count !== 'undefined' ? data.count : 0);
                    
                    // Generate Link
                    const linkFilter = JSON.stringify(filterPayload);
                    const link = `https://app.browswave.com/i/norm/clusters?filter=${encodeURIComponent(linkFilter)}&pageIndex=1&pageSize=100&sortBy=[]`;

                    results.push({
                        email: userEmail,
                        count: Number(count),
                        link: link
                    });
                } else {
                    console.error(`Failed for ${userEmail}`);
                    results.push({ email: userEmail, count: 0, link: '#', error: true });
                }

            } catch (err) {
                console.error(err);
                results.push({ email: userEmail, count: 0, link: '#', error: true });
            }
        }

        finishFiltration();
    }

    function finishFiltration() {
        isRunning = false;
        runBtn.disabled = false;
        progressContainer.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        // Calculate Median
        calculateStats();
        
        // Initial Sort and Render
        sortResults();
        renderTable();
    }

    function calculateStats() {
        if (results.length === 0) return;
        
        // Extract counts for median calculation
        const counts = results.map(r => r.count).sort((a, b) => a - b);
        let median = 0;
        
        if (counts.length > 0) {
            const mid = Math.floor(counts.length / 2);
            if (counts.length % 2 !== 0) {
                median = counts[mid];
            } else {
                median = (counts[mid - 1] + counts[mid]) / 2;
            }
        }

        medianDisplay.textContent = median.toFixed(1);

        // Calculate % diff for each result
        results = results.map(r => {
            let diff = 0;
            if (median !== 0) {
                diff = ((r.count - median) / median) * 100;
            } else if (r.count > 0) {
                diff = 100; // If median is 0 and count is > 0
            }
            return { ...r, diff };
        });
    }

    function sortResults() {
        results.sort((a, b) => {
            let valA = a[currentSort.key];
            let valB = b[currentSort.key];

            // If string (email), case insensitive
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return currentSort.dir === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.dir === 'asc' ? 1 : -1;
            return 0;
        });
    }

    function updateSortIcons() {
        document.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-active', 'asc', 'desc');
            th.querySelector('.arrow').textContent = '▼'; // reset
        });
        const activeTh = document.querySelector(`th[data-sort="${currentSort.key}"]`);
        if (activeTh) {
            activeTh.classList.add('sort-active', currentSort.dir);
            activeTh.querySelector('.arrow').textContent = currentSort.dir === 'asc' ? '▲' : '▼';
        }
    }

    function renderTable() {
        sortResults(); // ensure order
        resultsTableBody.innerHTML = '';
        
        results.forEach(row => {
            const tr = document.createElement('tr');
            
            // Diff formatting
            let diffHtml = '';
            if (row.diff > 0) {
                diffHtml = `<span class="diff-tag diff-pos">+${row.diff.toFixed(1)}%</span>`;
            } else if (row.diff < 0) {
                diffHtml = `<span class="diff-tag diff-neg">${row.diff.toFixed(1)}%</span>`;
            } else {
                diffHtml = `<span class="diff-tag" style="color:gray">0%</span>`;
            }

            tr.innerHTML = `
                <td>
                    <a href="${row.link}" target="_blank" class="user-link" title="Open in Browswave">
                        ${row.email}
                    </a>
                </td>
                <td>
                    ${row.count}
                    ${diffHtml}
                </td>
            `;
            resultsTableBody.appendChild(tr);
        });
    }

    function copyTableToClipboard() {
        // Create a temporary text format for Excel/Sheets (Tab separated)
        let text = "User\tCount\t% Diff\n";
        results.forEach(r => {
            text += `${r.email}\t${r.count}\t${r.diff.toFixed(2)}%\n`;
        });

        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "Copied!";
            setTimeout(() => copyBtn.textContent = originalText, 1500);
        }).catch(err => {
            console.error('Failed to copy', err);
            alert('Failed to copy table.');
        });
    }
});