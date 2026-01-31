/**
 * ============================================
 * VIGYAN.PREP ADMIN DASHBOARD V3
 * Real-time Data Integration & JWT Auth
 * Updated: January 31, 2026 - JWT Authorization Header
 * ============================================
 */

// Global State
const DashboardState = {
    stats: {},
    charts: {},
    activities: [],
    refreshInterval: null,
    isAuthenticated: false,
    authToken: null  // JWT token
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing Premium Dashboard v3...');

    // ✅ CRITICAL: Check authentication first
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
        console.error('❌ Not authenticated - redirecting to login');
        window.location.href = '/admin-login.html';
        return;
    }

    // Set greeting based on time
    setGreeting();

    // Load real data
    await loadDashboardData();

    // Initialize charts
    initializeCharts();

    // Setup navigation
    setupNavigation();

    // Setup auto-refresh (every 30 seconds)
    DashboardState.refreshInterval = setInterval(refreshDashboard, 30000);

    // Hide loading overlay
    setTimeout(() => {
        document.getElementById('loadingOverlay').style.display = 'none';
    }, 800);

    console.log('✅ Dashboard initialized successfully');
});

// ✅ NEW: Get Authorization Headers with JWT Token
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };

    // Add JWT token if available
    if (DashboardState.authToken) {
        headers['Authorization'] = `Bearer ${DashboardState.authToken}`;
        console.log('🔑 Adding Authorization header with token');
    }

    return headers;
}

// ✅ UPDATED: Check Admin Authentication with JWT
async function checkAdminAuth() {
    try {
        console.log('🔐 Checking admin authentication...');
        
        // Get stored auth data
        const authData = sessionStorage.getItem('adminAuth');
        if (!authData) {
            console.error('❌ No auth data in sessionStorage');
            return false;
        }

        const auth = JSON.parse(authData);
        if (!auth.authenticated || !auth.token) {
            console.error('❌ Invalid auth data');
            return false;
        }

        // Store token globally
        DashboardState.authToken = auth.token;
        console.log('✅ Token loaded from sessionStorage');

        // Verify token with backend
        const response = await fetch(`${window.API_BASE_URL}/api/admin/profile`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Auth check failed: ${response.status}`);
        }

        const profile = await response.json();
        console.log('✅ Authentication successful:', profile);
        
        // Update admin name in header
        const adminNameEl = document.getElementById('adminName');
        if (adminNameEl && profile.name) {
            adminNameEl.textContent = profile.name;
        } else if (adminNameEl && auth.username) {
            adminNameEl.textContent = auth.username;
        }

        DashboardState.isAuthenticated = true;
        return true;

    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        DashboardState.isAuthenticated = false;
        DashboardState.authToken = null;
        
        // Clear invalid auth data
        sessionStorage.removeItem('adminAuth');
        
        // Show error notification
        showErrorNotification('Session expired. Please login again.');
        
        return false;
    }
}

// ✅ UPDATED: Fetch Tests with JWT
async function fetchTests() {
    try {
        console.log('📋 Fetching tests...');
        const response = await fetch(`${window.API_BASE_URL}/api/admin/tests`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch tests: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Tests fetched:', data.tests?.length || 0);
        return data.tests || [];
    } catch (error) {
        console.error('❌ Error fetching tests:', error);
        return [];
    }
}

// ✅ UPDATED: Fetch Students with JWT
async function fetchStudents() {
    try {
        console.log('👥 Fetching students...');
        const response = await fetch(`${window.API_BASE_URL}/api/admin/students`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch students: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Students fetched:', data.students?.length || 0);
        return data.students || [];
    } catch (error) {
        console.error('❌ Error fetching students:', error);
        return [];
    }
}

// ✅ UPDATED: Fetch Transactions with JWT
async function fetchTransactions() {
    try {
        console.log('💰 Fetching transactions...');
        const response = await fetch(`${window.API_BASE_URL}/api/admin/transactions`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Transactions fetched:', data.transactions?.length || 0);
        return data.transactions || [];
    } catch (error) {
        console.error('❌ Error fetching transactions:', error);
        return [];
    }
}

// ✅ UPDATED: Logout function with token cleanup
window.logout = async function () {
    if (confirm('Are you sure you want to logout?')) {
        try {
            // Call logout API with JWT
            await fetch(`${window.API_BASE_URL}/api/admin/auth/logout`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Clear authentication data
        DashboardState.authToken = null;
        DashboardState.isAuthenticated = false;
        sessionStorage.removeItem('adminAuth');
        localStorage.clear();

        // Redirect to login
        window.location.href = '/admin-login.html';
    }
};

// [REST OF THE FUNCTIONS REMAIN THE SAME - Only auth-related parts updated]
// Keeping all other functions from the original file...

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
        z-index: 10000;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle" style="font-size: 20px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 20px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function setGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good Evening';

    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';

    const welcomeTitle = document.getElementById('welcomeTitle');
    if (welcomeTitle) {
        welcomeTitle.innerHTML = `${greeting}, Admin! 👋`;
    }
}

async function loadDashboardData() {
    try {
        console.log('📊 Fetching dashboard statistics...');
        
        document.getElementById('loadingOverlay').style.display = 'flex';

        const [testsData, studentsData, transactionsData] = await Promise.allSettled([
            fetchTests(),
            fetchStudents(),
            fetchTransactions()
        ]);

        const tests = testsData.status === 'fulfilled' ? testsData.value : [];
        const students = studentsData.status === 'fulfilled' ? studentsData.value : [];
        const transactions = transactionsData.status === 'fulfilled' ? transactionsData.value : [];

        if (testsData.status === 'rejected') console.error('Tests fetch error:', testsData.reason);
        if (studentsData.status === 'rejected') console.error('Students fetch error:', studentsData.reason);
        if (transactionsData.status === 'rejected') console.error('Transactions fetch error:', transactionsData.reason);

        updateStats({ tests, students, transactions });
        await loadRecentActivity();
        
        console.log('✅ Dashboard data loaded successfully');

    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showErrorNotification('Failed to load dashboard data: ' + error.message);
    } finally {
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}

function updateStats(data) {
    const { tests, students, transactions } = data;

    const totalTests = tests.length;
    updateStatCard('totalTests', totalTests);
    updateStatCard('testsTrend', calculateTrend(tests, 'createdAt'));

    const totalStudents = students.length;
    updateStatCard('totalStudents', totalStudents.toLocaleString());
    updateStatCard('studentsTrend', calculateTrend(students, 'createdAt'));

    const today = new Date().toDateString();
    const activeTests = tests.filter(test => {
        if (!test.scheduledDate) return false;
        return new Date(test.scheduledDate).toDateString() === today;
    }).length;
    updateStatCard('activeTests', activeTests);

    const totalRevenue = transactions.reduce((sum, t) => {
        if (t.status === 'completed' || t.status === 'success') {
            return sum + (parseFloat(t.amount) || 0);
        }
        return sum;
    }, 0);
    updateStatCard('totalRevenue', `₹${formatRevenue(totalRevenue)}`);
    updateStatCard('revenueTrend', calculateRevenueTrend(transactions));

    DashboardState.stats = { totalTests, totalStudents, activeTests, totalRevenue };
}

function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        const skeleton = element.querySelector('.skeleton');
        if (skeleton) skeleton.remove();
        element.textContent = value;
    }
}

function calculateTrend(data, dateField) {
    if (!data || data.length === 0) return '0%';

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentCount = data.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= lastWeek;
    }).length;

    const previousCount = data.length - recentCount;
    if (previousCount === 0) return '100%';

    const percentChange = ((recentCount / previousCount) * 100).toFixed(1);
    return `${percentChange}%`;
}

function calculateRevenueTrend(transactions) {
    if (!transactions || transactions.length === 0) return '0%';

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthRevenue = transactions
        .filter(t => {
            const date = new Date(t.createdAt);
            return date >= lastMonth && date < thisMonth && (t.status === 'completed' || t.status === 'success');
        })
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const thisMonthRevenue = transactions
        .filter(t => {
            const date = new Date(t.createdAt);
            return date >= thisMonth && (t.status === 'completed' || t.status === 'success');
        })
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    if (lastMonthRevenue === 0) return '100%';

    const percentChange = (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1);
    return `${percentChange}%`;
}

function formatRevenue(amount) {
    if (amount >= 10000000) return (amount / 10000000).toFixed(2) + 'Cr';
    else if (amount >= 100000) return (amount / 100000).toFixed(2) + 'L';
    else if (amount >= 1000) return (amount / 1000).toFixed(2) + 'K';
    return amount.toFixed(2);
}

function initializeCharts() {
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx) {
        DashboardState.charts.performance = new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Student Performance',
                    data: [65, 72, 68, 80, 75, 85, 90],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
}

async function loadRecentActivity() {
    const activities = [
        { icon: 'fa-user-plus', color: '#10B981', text: 'New student registered', time: '2 minutes ago' },
        { icon: 'fa-file-alt', color: '#3B82F6', text: 'New test created', time: '15 minutes ago' },
        { icon: 'fa-rupee-sign', color: '#8B5CF6', text: 'Payment received', time: '1 hour ago' }
    ];

    const activityList = document.getElementById('activityList');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${activity.color};">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) navigateTo(page);
        });
    });
}

function navigateTo(page) {
    console.log('📍 Navigating to:', page);
    document.querySelectorAll('.content-area').forEach(area => area.style.display = 'none');
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) targetPage.style.display = 'block';
}

async function refreshDashboard() {
    console.log('🔄 Refreshing dashboard data...');
    if (DashboardState.isAuthenticated) {
        await loadDashboardData();
    }
}

window.toggleProfileMenu = function() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.toggle('active');
};

window.addEventListener('beforeunload', () => {
    if (DashboardState.refreshInterval) {
        clearInterval(DashboardState.refreshInterval);
    }
});

window.showErrorNotification = showErrorNotification;
window.showSuccessNotification = showSuccessNotification;

console.log('✅ Dashboard v3 script loaded with JWT authentication');
