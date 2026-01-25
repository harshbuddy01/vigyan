/**
 * Transactions Module - REAL DATA ONLY
 * FIXED: 2026-01-25 - Using window.API_BASE_URL
 */

let allTransactions = [];

function initTransactions() {
    console.log('💳 Initializing Transactions page...');
    renderTransactionsPage();
    loadTransactions();
}

function renderTransactionsPage() {
    const container = document.getElementById('transactions-page');
    if (!container) return;
    
    container.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-receipt"></i> Transactions</h1>
            <p style="color: #64748b; margin-top: 8px;">View all payment transactions</p>
        </div>
        
        <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: center;">
            <select id="statusFilter" style="padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                <option value="all">All Status</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
            </select>
            <input type="text" id="transactionSearch" placeholder="Search transactions..." 
                   style="flex: 1; padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
            <button class="btn-primary" onclick="loadTransactions()">
                <i class="fas fa-sync"></i> Refresh
            </button>
        </div>
        
        <div class="card" style="overflow-x: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>TRANSACTION ID</th>
                        <th>STUDENT NAME</th>
                        <th>AMOUNT</th>
                        <th>PAYMENT METHOD</th>
                        <th>DATE</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody id="transactionsTableBody">
                    <tr><td colspan="7" style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i><br>
                        Loading transactions from database...
                    </td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('transactionSearch').addEventListener('input', applyFilters);
}

async function loadTransactions() {
    try {
        console.log('🔄 Fetching transactions from backend...');
        // ✅ FIXED: Using window.API_BASE_URL from config
        const response = await fetch(`${window.API_BASE_URL}/api/admin/transactions`);
        const data = await response.json();
        
        allTransactions = data.transactions || [];
        console.log(`✅ Loaded ${allTransactions.length} real transactions from database`);
        displayTransactions(allTransactions);
    } catch (error) {
        console.error('❌ Failed to load transactions:', error);
        document.getElementById('transactionsTableBody').innerHTML = `
            <tr><td colspan="7" style="text-align: center; padding: 40px; color: #ef4444;">
                <i class="fas fa-exclamation-circle" style="font-size: 24px;"></i><br>
                Failed to load transactions. Check backend connection.
            </td></tr>
        `;
    }
}

function applyFilters() {
    const status = document.getElementById('statusFilter').value;
    const search = document.getElementById('transactionSearch').value.toLowerCase();
    
    let filtered = allTransactions;
    
    if (status !== 'all') {
        filtered = filtered.filter(t => t.status === status);
    }
    
    if (search) {
        filtered = filtered.filter(t => 
            t.id.toLowerCase().includes(search) ||
            t.student.toLowerCase().includes(search) ||
            t.email.toLowerCase().includes(search)
        );
    }
    
    displayTransactions(filtered);
}

function displayTransactions(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;
    
    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="7" style="text-align: center; padding: 40px; color: #94a3b8;">
                <i class="fas fa-receipt" style="font-size: 24px;"></i><br>
                No transactions found
            </td></tr>
        `;
        return;
    }
    
    tbody.innerHTML = transactions.map(txn => `
        <tr>
            <td><strong>${txn.id}</strong></td>
            <td>${txn.student}<br><small style="color: #94a3b8;">${txn.email}</small></td>
            <td><strong style="color: #10b981;">₹${txn.amount.toLocaleString()}</strong></td>
            <td>
                ${txn.method}<br>
                <small style="color: #94a3b8;">
                    ${txn.method === 'UPI' ? txn.upiId : txn.method === 'Card' ? `****${txn.cardLast4}` : 'NetBanking'}
                </small>
            </td>
            <td>${txn.date}</td>
            <td><span class="${txn.status === 'Success' ? 'status-active' : txn.status === 'Pending' ? 'badge' : 'status-inactive'}">${txn.status}</span></td>
            <td>
                <button class="action-btn" onclick="viewTransaction('${txn.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function viewTransaction(id) {
    const txn = allTransactions.find(t => t.id === id);
    if (!txn) return;
    
    alert(`Transaction Details:\n\nID: ${txn.id}\nStudent: ${txn.student}\nEmail: ${txn.email}\nAmount: ₹${txn.amount}\nMethod: ${txn.method}\nDate: ${txn.date}\nStatus: ${txn.status}`);
}

window.initTransactions = initTransactions;
window.viewTransaction = viewTransaction;