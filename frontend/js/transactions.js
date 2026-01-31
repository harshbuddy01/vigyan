/**
 * Transactions Module with Price Management
 * UPDATED: 2026-02-01 - Added secure price management UI
 */

let allTransactions = [];
let allTests = [];

function initTransactions() {
    console.log('💳 Initializing Transactions page with Price Management...');
    renderTransactionsPage();
    loadTests(); // Load tests for price management
    loadTransactions();
}

function renderTransactionsPage() {
    const container = document.getElementById('transactions-page');
    if (!container) return;
    
    container.innerHTML = `
        <!-- 🔒 PRICE MANAGEMENT SECTION -->
        <div class="page-header">
            <h1><i class="fas fa-dollar-sign"></i> Price Management & Transactions</h1>
            <p style="color: #64748b; margin-top: 8px;">Manage test pricing and view payment history</p>
        </div>

        <!-- Price Management Card -->
        <div class="form-section" style="margin-bottom: 32px;">
            <h2><i class="fas fa-tag"></i> Test Price Management</h2>
            <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 14px;">
                🔒 Secure admin-only interface. All changes are logged with IP and timestamp.
            </p>
            
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 16px; align-items: end;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="testSelector">🎯 Select Test Series</label>
                    <select id="testSelector" class="form-control">
                        <option value="">-- Select a test --</option>
                    </select>
                </div>
                
                <div class="form-group" style="margin-bottom: 0;">
                    <label>Current Price</label>
                    <div id="currentPrice" style="padding: 12px 16px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 10px; color: var(--success); font-weight: 700; font-size: 18px; font-family: 'Roboto Mono', monospace;">
                        ₹--
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="newPrice">New Price (₹)</label>
                    <input type="number" id="newPrice" placeholder="e.g. 299" min="1" max="99999" step="1" class="form-control">
                </div>
                
                <button class="btn-primary" onclick="updateTestPrice()" style="height: 46px;">
                    <i class="fas fa-save"></i> Update Price
                </button>
            </div>
            
            <div id="priceUpdateStatus" style="margin-top: 16px; display: none;"></div>
            
            <!-- Price History Button -->
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
                <button class="btn-secondary" onclick="showPriceHistory()" id="historyBtn" disabled>
                    <i class="fas fa-history"></i> View Price Change History
                </button>
            </div>
        </div>

        <!-- Price History Modal (hidden by default) -->
        <div id="priceHistoryModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; overflow-y: auto;">
            <div style="max-width: 800px; margin: 50px auto; background: var(--bg-card); border-radius: 16px; padding: 32px; position: relative;">
                <button onclick="closePriceHistory()" style="position: absolute; top: 16px; right: 16px; background: var(--bg-hover); border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; color: var(--text-primary);">
                    <i class="fas fa-times"></i>
                </button>
                <h2 style="margin-bottom: 24px;"><i class="fas fa-history"></i> Price Change History</h2>
                <div id="priceHistoryContent">
                    <p style="text-align: center; color: var(--text-muted); padding: 40px;">Loading...</p>
                </div>
            </div>
        </div>

        <!-- TRANSACTIONS TABLE -->
        <div class="page-header" style="margin-top: 48px;">
            <h1><i class="fas fa-receipt"></i> Payment Transactions</h1>
        </div>
        
        <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: center;">
            <select id="statusFilter" style="padding: 10px 16px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-primary); border-radius: 8px; font-size: 14px;">
                <option value="all">All Status</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
            </select>
            <input type="text" id="transactionSearch" placeholder="Search transactions..." 
                   style="flex: 1; padding: 10px 16px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-primary); border-radius: 8px; font-size: 14px;">
            <button class="btn-primary" onclick="loadTransactions()">
                <i class="fas fa-sync"></i> Refresh
            </button>
        </div>
        
        <div class="form-section" style="overflow-x: auto;">
            <table class="data-table" style="width: 100%;">
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
    document.getElementById('testSelector').addEventListener('change', onTestSelected);
}

// 🎯 Load all tests for price management
async function loadTests() {
    try {
        console.log('🔍 Fetching tests from admin API...');
        const response = await fetch(`${window.API_BASE_URL}/api/admin/tests`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        allTests = data.tests || [];
        
        console.log(`✅ Loaded ${allTests.length} tests`);
        populateTestSelector();
    } catch (error) {
        console.error('❌ Failed to load tests:', error);
        showPriceStatus('error', '❌ Failed to load tests. Please check your admin authentication.');
    }
}

function populateTestSelector() {
    const selector = document.getElementById('testSelector');
    if (!selector) return;
    
    selector.innerHTML = '<option value="">-- Select a test --</option>';
    
    allTests.forEach(test => {
        const option = document.createElement('option');
        option.value = test.testId;
        option.textContent = `${test.name} (${test.testId.toUpperCase()})`;
        option.dataset.price = test.price;
        selector.appendChild(option);
    });
}

function onTestSelected() {
    const selector = document.getElementById('testSelector');
    const selectedOption = selector.options[selector.selectedIndex];
    const currentPriceDiv = document.getElementById('currentPrice');
    const historyBtn = document.getElementById('historyBtn');
    
    if (selectedOption.value) {
        const price = selectedOption.dataset.price;
        currentPriceDiv.textContent = `₹${parseInt(price).toLocaleString()}`;
        currentPriceDiv.style.color = 'var(--success)';
        historyBtn.disabled = false;
    } else {
        currentPriceDiv.textContent = '₹--';
        currentPriceDiv.style.color = 'var(--text-muted)';
        historyBtn.disabled = true;
    }
    
    // Clear new price input and status
    document.getElementById('newPrice').value = '';
    document.getElementById('priceUpdateStatus').style.display = 'none';
}

// 🔒 SECURE: Update test price (admin only)
async function updateTestPrice() {
    const testSelector = document.getElementById('testSelector');
    const newPriceInput = document.getElementById('newPrice');
    
    const testId = testSelector.value;
    const newPrice = parseInt(newPriceInput.value);
    
    // Validation
    if (!testId) {
        showPriceStatus('error', '⚠️ Please select a test first');
        return;
    }
    
    if (!newPrice || newPrice < 1 || newPrice > 99999) {
        showPriceStatus('error', '⚠️ Price must be between ₹1 and ₹99,999');
        return;
    }
    
    const currentPrice = parseInt(testSelector.options[testSelector.selectedIndex].dataset.price);
    
    if (newPrice === currentPrice) {
        showPriceStatus('error', '⚠️ New price is same as current price');
        return;
    }
    
    // Confirm with admin
    const testName = testSelector.options[testSelector.selectedIndex].textContent;
    if (!confirm(`🔒 Confirm Price Change\n\nTest: ${testName}\nCurrent: ₹${currentPrice}\nNew: ₹${newPrice}\n\nThis change will be logged and applied immediately.`)) {
        return;
    }
    
    showPriceStatus('info', '🔄 Updating price...');
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/admin/tests/${testId}/price`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ price: newPrice })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update price');
        }
        
        console.log('✅ Price updated:', data);
        showPriceStatus('success', `✅ ${data.message}`);
        
        // Update local cache
        const testIndex = allTests.findIndex(t => t.testId === testId);
        if (testIndex !== -1) {
            allTests[testIndex].price = newPrice;
        }
        
        // Refresh selector
        populateTestSelector();
        testSelector.value = testId;
        onTestSelected();
        
        // Clear input
        newPriceInput.value = '';
        
    } catch (error) {
        console.error('❌ Price update failed:', error);
        showPriceStatus('error', `❌ ${error.message}`);
    }
}

function showPriceStatus(type, message) {
    const statusDiv = document.getElementById('priceUpdateStatus');
    statusDiv.style.display = 'block';
    
    const colors = {
        success: { bg: 'rgba(16, 185, 129, 0.15)', text: 'var(--success)', icon: 'check-circle' },
        error: { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--danger)', icon: 'exclamation-circle' },
        info: { bg: 'rgba(37, 99, 235, 0.15)', text: 'var(--primary)', icon: 'info-circle' }
    };
    
    const style = colors[type] || colors.info;
    
    statusDiv.innerHTML = `
        <div style="padding: 16px; background: ${style.bg}; border-radius: 10px; color: ${style.text}; font-weight: 600; font-size: 14px;">
            <i class="fas fa-${style.icon}"></i> ${message}
        </div>
    `;
}

// 📜 Show price history for selected test
async function showPriceHistory() {
    const testSelector = document.getElementById('testSelector');
    const testId = testSelector.value;
    
    if (!testId) return;
    
    const modal = document.getElementById('priceHistoryModal');
    const content = document.getElementById('priceHistoryContent');
    
    modal.style.display = 'block';
    content.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Loading history...</p>';
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/admin/tests/${testId}/price-history`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to load history');
        }
        
        if (data.history.length === 0) {
            content.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">No price changes recorded yet.</p>';
            return;
        }
        
        content.innerHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-primary); text-align: left;">
                        <th style="padding: 12px; border-bottom: 2px solid var(--border);">Date & Time</th>
                        <th style="padding: 12px; border-bottom: 2px solid var(--border);">Old Price</th>
                        <th style="padding: 12px; border-bottom: 2px solid var(--border);">New Price</th>
                        <th style="padding: 12px; border-bottom: 2px solid var(--border);">Changed By</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.history.map(h => `
                        <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 12px; font-size: 13px;">${new Date(h.changedAt).toLocaleString()}</td>
                            <td style="padding: 12px; color: var(--danger); font-weight: 600;">₹${h.oldPrice}</td>
                            <td style="padding: 12px; color: var(--success); font-weight: 600;">₹${h.newPrice}</td>
                            <td style="padding: 12px; font-size: 13px;">${h.changedBy}<br><small style="color: var(--text-muted);">${h.ipAddress}</small></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('❌ Failed to load price history:', error);
        content.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 40px;">❌ ${error.message}</p>`;
    }
}

function closePriceHistory() {
    document.getElementById('priceHistoryModal').style.display = 'none';
}

// Original transaction functions (unchanged)
async function loadTransactions() {
    try {
        console.log('🔄 Fetching transactions from backend...');
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

// Export functions
window.initTransactions = initTransactions;
window.updateTestPrice = updateTestPrice;
window.showPriceHistory = showPriceHistory;
window.closePriceHistory = closePriceHistory;
window.viewTransaction = viewTransaction;
