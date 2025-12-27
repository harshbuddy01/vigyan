/**
 * Transactions Handler
 */

const mockTransactions = [
    { id: 'TXN001', student: 'Rahul Sharma', amount: 2999, date: '2025-12-20', status: 'Success', method: 'UPI' },
    { id: 'TXN002', student: 'Priya Patel', amount: 2999, date: '2025-12-21', status: 'Success', method: 'Card' },
    { id: 'TXN003', student: 'Amit Kumar', amount: 2999, date: '2025-12-22', status: 'Pending', method: 'UPI' },
    { id: 'TXN004', student: 'Neha Singh', amount: 2999, date: '2025-12-23', status: 'Failed', method: 'Card' }
];

function initTransactions() {
    renderTransactionsTable();
    
    document.getElementById('exportTransactions')?.addEventListener('click', () => {
        AdminUtils.exportToCSV(mockTransactions, 'transactions.csv');
        AdminUtils.showToast('Transactions exported successfully!', 'success');
    });
}

function renderTransactionsTable() {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;
    
    if (mockTransactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">No transactions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = mockTransactions.map(t => `
        <tr>
            <td><strong>${t.id}</strong></td>
            <td>${t.student}</td>
            <td>${AdminUtils.formatCurrency(t.amount)}</td>
            <td>${AdminUtils.formatDate(t.date, 'short')}</td>
            <td><span class="payment-method">${t.method}</span></td>
            <td><span class="status-badge status-${t.status.toLowerCase()}">${t.status}</span></td>
            <td>
                <button class="action-btn" onclick="viewTransactionDetails('${t.id}')"><i class="fas fa-eye"></i></button>
            </td>
        </tr>
    `).join('');
}

function viewTransactionDetails(id) {
    AdminUtils.showToast(`Viewing details for ${id}`, 'success');
}

if (document.getElementById('transactionsTableBody')) {
    initTransactions();
}