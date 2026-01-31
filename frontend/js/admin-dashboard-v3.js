/**
 * ============================================
 * VIGYAN.PREP ADMIN DASHBOARD V3
 * Real-time Data Integration & JWT Auth
 * Updated: January 31, 2026 - Complete Version with JWT
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
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
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

// ✅ NEW: Show Error Notification
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

// ✅ NEW: Show Success Notification
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

// Set Greeting Based on Time
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

// Load Dashboard Data from API
async function loadDashboardData() {
    try {
        console.log('📊 Fetching dashboard statistics...');
        
        // Show loading state
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.style.display = 'flex';

        // Fetch all data in parallel with error handling
        const [testsData, studentsData, transactionsData] = await Promise.allSettled([
            fetchTests(),
            fetchStudents(),
            fetchTransactions()
        ]);

        // Extract data from settled promises
        const tests = testsData.status === 'fulfilled' ? testsData.value : [];
        const students = studentsData.status === 'fulfilled' ? studentsData.value : [];
        const transactions = transactionsData.status === 'fulfilled' ? transactionsData.value : [];

        // Log any errors
        if (testsData.status === 'rejected') console.error('Tests fetch error:', testsData.reason);
        if (studentsData.status === 'rejected') console.error('Students fetch error:', studentsData.reason);
        if (transactionsData.status === 'rejected') console.error('Transactions fetch error:', transactionsData.reason);

        // Update stats
        updateStats({
            tests,
            students,
            transactions
        });

        // Load recent activity
        await loadRecentActivity();
        
        console.log('✅ Dashboard data loaded successfully');

    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showErrorNotification('Failed to load dashboard data: ' + error.message);
    } finally {
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.style.display = 'none';
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

// Update Statistics
function updateStats(data) {
    const { tests, students, transactions } = data;

    console.log('📊 Updating stats with:', { 
        tests: tests.length, 
        students: students.length, 
        transactions: transactions.length 
    });

    // Total Tests
    const totalTests = tests.length;
    updateStatCard('totalTests', totalTests);
    updateStatCard('testsTrend', calculateTrend(tests, 'createdAt'));

    // Total Students
    const totalStudents = students.length;
    updateStatCard('totalStudents', totalStudents.toLocaleString());
    updateStatCard('studentsTrend', calculateTrend(students, 'createdAt'));

    // Active Tests (tests scheduled for today)
    const today = new Date().toDateString();
    const activeTests = tests.filter(test => {
        if (!test.scheduledDate) return false;
        return new Date(test.scheduledDate).toDateString() === today;
    }).length;
    updateStatCard('activeTests', activeTests);

    // Total Revenue
    const totalRevenue = transactions.reduce((sum, t) => {
        if (t.status === 'completed' || t.status === 'success') {
            return sum + (parseFloat(t.amount) || 0);
        }
        return sum;
    }, 0);
    updateStatCard('totalRevenue', `₹${formatRevenue(totalRevenue)}`);
    updateStatCard('revenueTrend', calculateRevenueTrend(transactions));

    // Store in state
    DashboardState.stats = { totalTests, totalStudents, activeTests, totalRevenue };
    
    console.log('✅ Stats updated:', DashboardState.stats);
}

// Update Stat Card
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        // Remove skeleton if present
        const skeleton = element.querySelector('.skeleton');
        if (skeleton) {
            skeleton.remove();
        }
        element.textContent = value;
        console.log(`✅ Updated ${id} to: ${value}`);
    } else {
        console.warn(`⚠️ Element not found: ${id}`);
    }
}

// Calculate Trend (percentage change from last week)
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

// Calculate Revenue Trend
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

// Format Revenue
function formatRevenue(amount) {
    if (amount >= 10000000) {
        return (amount / 10000000).toFixed(2) + 'Cr';
    } else if (amount >= 100000) {
        return (amount / 100000).toFixed(2) + 'L';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(2) + 'K';
    }
    return amount.toFixed(2);
}

// Initialize Charts
function initializeCharts() {
    // Performance Chart (Line Chart)
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
                    fill: true,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1F2937',
                        titleColor: '#F9FAFB',
                        bodyColor: '#D1D5DB',
                        borderColor: '#374151',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#374151',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    }
                }
            }
        });
    }

    // Distribution Chart (Doughnut Chart)
    const distributionCtx = document.getElementById('distributionChart');
    if (distributionCtx) {
        DashboardState.charts.distribution = new Chart(distributionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Inactive', 'Pending'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: [
                        '#10B981',
                        '#EF4444',
                        '#F59E0B'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#D1D5DB',
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1F2937',
                        titleColor: '#F9FAFB',
                        bodyColor: '#D1D5DB',
                        borderColor: '#374151',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                cutout: '70%'
            }
        });
    }
}

// Update Chart Data
function updateChart(period) {
    console.log('📊 Updating chart for period:', period);

    // Update active button
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update chart data based on period
    const chart = DashboardState.charts.performance;
    if (chart) {
        chart.data.datasets[0].data = generateRandomData(7);
        chart.update();
    }
}

// Generate Random Data (for demo)
function generateRandomData(count) {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 40) + 60);
}

// Load Recent Activity
async function loadRecentActivity() {
    const activities = [
        {
            icon: 'fa-user-plus',
            color: '#10B981',
            text: 'New student registered',
            time: '2 minutes ago'
        },
        {
            icon: 'fa-file-alt',
            color: '#3B82F6',
            text: 'New test created',
            time: '15 minutes ago'
        },
        {
            icon: 'fa-rupee-sign',
            color: '#8B5CF6',
            text: 'Payment received',
            time: '1 hour ago'
        },
        {
            icon: 'fa-chart-line',
            color: '#F59E0B',
            text: 'Test completed by students',
            time: '2 hours ago'
        },
        {
            icon: 'fa-question-circle',
            color: '#0EA5E9',
            text: 'New questions added',
            time: '3 hours ago'
        }
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

// Setup Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const page = link.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });
}

// Navigate to Page
function navigateTo(page) {
    console.log('📍 Navigating to:', page);

    // Hide all pages
    document.querySelectorAll('.content-area').forEach(area => {
        area.style.display = 'none';
    });

    // Show selected page
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) {
        targetPage.style.display = 'block';
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = formatPageTitle(page);
    }

    // Call page initialization function
    callPageInit(page);
}

// ✅ FIXED: Call page-specific initialization function with retry logic
function callPageInit(page) {
    const pageInitMap = {
        'create-test': 'initCreateTest',
        'test-calendar': 'initTestCalendar',
        'scheduled-tests': 'initScheduledTests',
        'past-tests': 'initPastTests',
        'add-questions': 'initAddQuestions',
        'view-questions': 'initViewQuestions',
        'upload-pdf': 'initUploadPDF',
        'all-students': 'initStudents',
        'add-student': 'initAddStudent',
        'transactions': 'initTransactions',
        'view-results': 'initResults',
        'performance': 'initPerformance'
    };

    const initFunctionName = pageInitMap[page];

    // Skip dashboard (no init needed)
    if (page === 'dashboard') return;

    // If no mapping exists, show placeholder
    if (!initFunctionName) {
        console.warn(`⚠️ No init function mapped for page: ${page}`);
        showPagePlaceholder(page);
        return;
    }

    // Try calling the init function
    function attemptInit(retryCount = 0) {
        if (typeof window[initFunctionName] === 'function') {
            console.log(`🚀 Calling ${initFunctionName}()`);
            try {
                window[initFunctionName]();
            } catch (error) {
                console.error(`❌ Error initializing ${page}:`, error);
                showErrorNotification(`Failed to load ${formatPageTitle(page)}`);
            }
        } else {
            // Function not loaded yet, retry up to 3 times
            if (retryCount < 3) {
                console.log(`⏳ ${initFunctionName} not ready, retrying... (${retryCount + 1}/3)`);
                setTimeout(() => attemptInit(retryCount + 1), 200);
            } else {
                console.error(`❌ ${initFunctionName} not found after 3 retries`);
                showPagePlaceholder(page, `Function ${initFunctionName} not loaded`);
            }
        }
    }

    attemptInit();
}

// ✅ NEW: Show placeholder when page init fails
function showPagePlaceholder(page, errorMsg = '') {
    const targetPage = document.getElementById(`${page}-page`);
    if (!targetPage) return;

    const pageTitle = formatPageTitle(page);
    targetPage.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            text-align: center;
            padding: 40px;
        ">
            <div style="
                font-size: 64px;
                margin-bottom: 20px;
                opacity: 0.5;
            ">🚧</div>
            <h2 style="
                font-size: 24px;
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 12px;
            ">${pageTitle}</h2>
            <p style="
                font-size: 16px;
                color: var(--text-secondary);
                max-width: 500px;
                line-height: 1.6;
            ">
                This page is under development or the required script hasn't loaded yet.
                ${errorMsg ? `<br><small style="color: var(--text-muted); margin-top: 8px; display: block;">${errorMsg}</small>` : ''}
            </p>
            <button 
                onclick="window.location.reload()" 
                style="
                    margin-top: 24px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, var(--primary), var(--primary-light));
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                "
            >
                <i class="fas fa-redo"></i> Reload Page
            </button>
        </div>
    `;
}

// Format Page Title
function formatPageTitle(page) {
    return page
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Refresh Dashboard
async function refreshDashboard() {
    console.log('🔄 Refreshing dashboard data...');
    if (DashboardState.isAuthenticated) {
        await loadDashboardData();
    }
}

// Show Error
function showError(message) {
    console.error('❌', message);
    showErrorNotification(message);
}

// Toggle Profile Menu
function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (notificationDropdown && notificationDropdown.classList.contains('active')) {
        notificationDropdown.classList.remove('active');
    }

    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Toggle Notification Dropdown
function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileDropdown && profileDropdown.classList.contains('active')) {
        profileDropdown.classList.remove('active');
    }

    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Mark all notifications as read
window.markAllAsRead = function () {
    const items = document.querySelectorAll('.notification-item.unread');
    items.forEach(item => item.classList.remove('unread'));

    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.style.display = 'none';
    }
};

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

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const notificationBtn = document.getElementById('notificationBtn');

const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    if (themeToggle) {
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        const icon = themeToggle.querySelector('i');

        if (isLight) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark');
        }
    });
}

if (notificationBtn) {
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNotificationDropdown();
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileDropdown = document.getElementById('profileDropdown');
    const notificationBtn = document.getElementById('notificationBtn');
    const adminProfile = document.querySelector('.admin-profile');

    if (notificationDropdown &&
        !notificationDropdown.contains(e.target) &&
        notificationBtn &&
        !notificationBtn.contains(e.target)) {
        notificationDropdown.classList.remove('active');
    }

    if (profileDropdown &&
        !profileDropdown.contains(e.target) &&
        adminProfile &&
        !adminProfile.contains(e.target)) {
        profileDropdown.classList.remove('active');
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (DashboardState.refreshInterval) {
        clearInterval(DashboardState.refreshInterval);
    }
});

// Export functions for global access
window.navigateTo = navigateTo;
window.toggleProfileMenu = toggleProfileMenu;
window.showErrorNotification = showErrorNotification;
window.showSuccessNotification = showSuccessNotification;

console.log('✅ Dashboard v3 script loaded with complete JWT authentication');
