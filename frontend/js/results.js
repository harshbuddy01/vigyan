/**
 * Results Viewer
 */

const mockResults = [
    { id: 1, test: 'NEST Mock 1', student: 'Rahul Sharma', score: 85, total: 100, rank: 12, date: '2025-12-20' },
    { id: 2, test: 'NEST Mock 1', student: 'Priya Patel', score: 92, total: 100, rank: 5, date: '2025-12-20' },
    { id: 3, test: 'IAT Mock 2', student: 'Amit Kumar', score: 78, total: 100, rank: 25, date: '2025-12-22' }
];

function initResults() {
    renderResultsTable();
    
    document.getElementById('exportResults')?.addEventListener('click', () => {
        AdminUtils.exportToCSV(mockResults, 'test-results.csv');
        AdminUtils.showToast('Results exported successfully!', 'success');
    });
}

function renderResultsTable() {
    const tbody = document.getElementById('resultsTableBody');
    if (!tbody) return;
    
    if (mockResults.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">No results found</td></tr>';
        return;
    }
    
    tbody.innerHTML = mockResults.map(r => {
        const percentage = ((r.score / r.total) * 100).toFixed(1);
        return `
            <tr>
                <td>${r.id}</td>
                <td><strong>${r.test}</strong></td>
                <td>${r.student}</td>
                <td><strong>${r.score}/${r.total}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="flex: 1; background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${percentage}%; background: ${percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444'}; height: 100%;"></div>
                        </div>
                        <span style="font-weight: 600; color: #1e293b;">${percentage}%</span>
                    </div>
                </td>
                <td><span class="rank-badge">Rank ${r.rank}</span></td>
                <td>${AdminUtils.formatDate(r.date, 'short')}</td>
            </tr>
        `;
    }).join('');
}

if (document.getElementById('resultsTableBody')) {
    initResults();
}