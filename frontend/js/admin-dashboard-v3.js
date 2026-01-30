/**
 * ============================================
 * VIGYAN.PREP ADMIN DASHBOARD V3
 * Real-time Data Integration & Charts
 * Created: January 27, 2026
 * ============================================
 */

// Global State
const DashboardState = {
    stats: {},
    charts: {},
    activities: [],
    refreshInterval: null
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing Premium Dashboard v3...');

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

        // Fetch all data in parallel
        const [testsData, studentsData, transactionsData] = await Promise.all([
            fetchTests(),
            fetchStudents(),
            fetchTransactions()
        ]);

        // Update stats
        updateStats({
            tests: testsData,
            students: studentsData,
            transactions: transactionsData
        });

        // Update stats
        updateStats({
            tests: testsData,
            students: studentsData,
            transactions: transactionsData
        });

        // Load recent activity
        await loadRecentActivity();

    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Fetch Tests
async function fetchTests() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/admin/tests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'  // ✅ SECURITY FIX: Send JWT cookie
        });

        if (!response.ok) throw new Error('Failed to fetch tests');

        const data = await response.json();
        return data.tests || [];
    } catch (error) {
        console.error('Error fetching tests:', error);
        return [];
    }
}

// Fetch Students
async function fetchStudents() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/admin/students`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'  // ✅ SECURITY FIX: Send JWT cookie
        });

        if (!response.ok) throw new Error('Failed to fetch students');

        const data = await response.json();
        return data.students || [];
    } catch (error) {
        console.error('Error fetching students:', error);
        return [];
    }
}

// Fetch Transactions
async function fetchTransactions() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/admin/transactions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'  // ✅ SECURITY FIX: Send JWT cookie
        });

        if (!response.ok) throw new Error('Failed to fetch transactions');

        const data = await response.json();
        return data.transactions || [];
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

// Update Statistics
function updateStats(data) {
    const { tests, students, transactions } = data;

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
    // This would fetch new data from API in production
    const chart = DashboardState.charts.performance;
    if (chart) {
        // Example: Update with new data
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
            text: 'New student registered: Rahul Sharma',
            time: '2 minutes ago'
        },
        {
            icon: 'fa-file-alt',
            color: '#3B82F6',
            text: 'New test created: Physics Mock Test #5',
            time: '15 minutes ago'
        },
        {
            icon: 'fa-rupee-sign',
            color: '#8B5CF6',
            text: 'Payment received: ₹1,999 from Priya Patel',
            time: '1 hour ago'
        },
        {
            icon: 'fa-chart-line',
            color: '#F59E0B',
            text: 'Test completed: 45 students',
            time: '2 hours ago'
        },
        {
            icon: 'fa-question-circle',
            color: '#0EA5E9',
            text: '50 new questions added to Chemistry',
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

    // ✅ FIX: Call page initialization function to render content
    callPageInit(page);
}

// ✅ NEW: Call page-specific initialization function
function callPageInit(page) {
    // Map of page names to their init functions
    const pageInitMap = {
        'create-test': 'initCreateTest',
        'test-calendar': 'initTestCalendar',
        'scheduled-tests': 'initScheduledTests',
        'past-tests': 'initPastTests',
        'add-questions': 'initAddQuestions',
        'view-questions': 'initViewQuestions',
        'upload-pdf': 'initUploadPdf',
        'upload-image': 'initUploadImage',
        'all-students': 'initStudents',
        'add-student': 'initAddStudent',
        'transactions': 'initTransactions',
        'view-results': 'initResults',
        'performance': 'initPerformance'
    };

    const initFunctionName = pageInitMap[page];

    if (initFunctionName && typeof window[initFunctionName] === 'function') {
        console.log(`🚀 Calling ${initFunctionName}()`);
        try {
            window[initFunctionName]();
        } catch (error) {
            console.error(`❌ Error initializing ${page}:`, error);
            // Show error message on the page
            const targetPage = document.getElementById(`${page}-page`);
            if (targetPage) {
                targetPage.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: #ef4444;">
                        <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 16px;"></i>
                        <h3 style="margin: 0 0 8px 0;">Failed to Load Page</h3>
                        <p style="margin: 0 0 20px 0; color: #94a3b8;">
                            An error occurred while loading this page. Please try again.
                        </p>
                        <button onclick="navigateTo('${page}')" class="btn-primary">
                            <i class="fas fa-sync"></i> Retry
                        </button>
                    </div>
                `;
            }
        }
    } else if (page !== 'dashboard') {
        console.warn(`⚠️ No init function found for page: ${page}`);
    }
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
    await loadDashboardData();
}

// Show Error
function showError(message) {
    console.error('❌', message);
    // You can implement a toast notification here
}

// Toggle Profile Menu
function toggleProfileMenu() {
    // Implement profile dropdown menu
    console.log('👤 Profile menu clicked');
}

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        console.log('🎨 Theme toggle clicked (coming soon)');
        // Implement light/dark theme toggle
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (DashboardState.refreshInterval) {
        clearInterval(DashboardState.refreshInterval);
    }
});

// ✅ Export navigateTo for global access (used by HTML onclick handlers)
window.navigateTo = navigateTo;

console.log('✅ Dashboard v3 script loaded');

