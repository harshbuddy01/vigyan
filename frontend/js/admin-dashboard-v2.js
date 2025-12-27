/**
 * Admin Dashboard Main - Connected to Backend
 */

let performanceChart = null;

// Initialize dashboard
async function initDashboard() {
    console.log('Initializing dashboard...');
    
    // Check authentication
    checkAuth();
    
    // Setup navigation
    setupNavigation();
    
    // Load dashboard data
    await loadDashboardData();
    
    console.log('Dashboard initialized successfully');
}

// Check authentication
function checkAuth() {
    const sessionAuth = sessionStorage.getItem('adminAuth');
    const localAuth = localStorage.getItem('adminAuth');
    
    if (!sessionAuth && !localAuth) {
        window.location.href = 'admin-login.html';
        return;
    }
}

// Logout function
function logout() {
    AdminUtils.showConfirmModal(
        'Are you sure you want to logout?',
        () => {
            sessionStorage.removeItem('adminAuth');
            localStorage.removeItem('adminAuth');
            window.location.href = 'admin-login.html';
        }
    );
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.content-area');
    const pageTitle = document.querySelector('.page-title');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Hide all pages
            pages.forEach(p => p.style.display = 'none');
            
            // Show selected page
            const pageName = link.dataset.page;
            const targetPage = document.getElementById(`${pageName}-page`);
            if (targetPage) {
                targetPage.style.display = 'block';
                
                // Update page title
                const linkText = link.querySelector('span').textContent;
                pageTitle.textContent = linkText;
                
                // Load page-specific data
                loadPageData(pageName);
            }
        });
    });
}

// Load page-specific data
async function loadPageData(pageName) {
    try {
        switch(pageName) {
            case 'dashboard':
                await loadDashboardData();
                break;
            case 'view-questions':
                if (window.initViewQuestions) window.initViewQuestions();
                break;
            case 'all-students':
                if (window.initStudents) window.initStudents();
                break;
            case 'transactions':
                if (window.initTransactions) window.initTransactions();
                break;
            case 'view-results':
                if (window.initResults) window.initResults();
                break;
        }
    } catch (error) {
        console.error('Error loading page data:', error);
        AdminUtils.showToast('Failed to load data. Using cached data.', 'error');
    }
}

// Load dashboard data from backend
async function loadDashboardData() {
    try {
        // Try to load from backend
        const stats = await AdminAPI.getDashboardStats();
        updateDashboardStats(stats);
        
        const performanceData = await AdminAPI.getPerformanceData();
        updatePerformanceChart(performanceData);
        
        const upcomingTests = await AdminAPI.getUpcomingTests();
        updateUpcomingTests(upcomingTests);
        
        const recentActivity = await AdminAPI.getRecentActivity();
        updateRecentActivity(recentActivity);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        console.log('Using fallback data...');
        
        // Fallback to demo data
        loadDashboardFallbackData();
    }
}

// Update dashboard stats
function updateDashboardStats(stats) {
    const statCards = {
        tests: { value: stats.activeTests || 0, trend: stats.testsTrend || 0 },
        students: { value: stats.totalStudents || 0, trend: stats.studentsTrend || 0 },
        exams: { value: stats.todayExams || 0 },
        revenue: { value: stats.monthlyRevenue || 0, trend: stats.revenueTrend || 0 }
    };
    
    // Update stat card values
    document.querySelector('.stat-card.blue .stat-value').textContent = statCards.tests.value;
    document.querySelector('.stat-card.green .stat-value').textContent = statCards.students.value;
    document.querySelector('.stat-card.orange .stat-value').textContent = statCards.exams.value;
    document.querySelector('.stat-card.purple .stat-value').textContent = `₹${(statCards.revenue.value / 100000).toFixed(1)}L`;
}

// Update performance chart
function updatePerformanceChart(data) {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (performanceChart) {
        performanceChart.destroy();
    }
    
    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Average Score',
                data: data.scores || [65, 72, 68, 75, 78, 82, 85],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { callback: value => value + '%' }
                }
            }
        }
    });
}

// Update upcoming tests
function updateUpcomingTests(tests) {
    const container = document.querySelector('.test-list');
    if (!container) return;
    
    if (!tests || tests.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 20px;">No upcoming tests</p>';
        return;
    }
    
    container.innerHTML = tests.slice(0, 5).map(test => `
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h4 style="font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 4px;">${test.name}</h4>
                    <p style="font-size: 12px; color: #64748b;">${test.subject} • ${test.duration} min</p>
                </div>
                <span style="padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 12px; font-size: 12px; font-weight: 600;">${AdminUtils.formatDate(test.date, 'short')}</span>
            </div>
        </div>
    `).join('');
}

// Update recent activity
function updateRecentActivity(activities) {
    const container = document.querySelector('.activity-list');
    if (!container) return;
    
    if (!activities || activities.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 20px;">No recent activity</p>';
        return;
    }
    
    container.innerHTML = activities.slice(0, 5).map(activity => `
        <div style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <div style="display: flex; gap: 12px; align-items: start;">
                <div style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-${activity.icon}" style="color: #6366f1; font-size: 14px;"></i>
                </div>
                <div style="flex: 1;">
                    <p style="font-size: 13px; color: #0f172a; margin-bottom: 2px;">${activity.message}</p>
                    <p style="font-size: 11px; color: #94a3b8;">${activity.time}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Fallback data
function loadDashboardFallbackData() {
    updateDashboardStats({
        activeTests: 24,
        testsTrend: 12,
        totalStudents: 1250,
        studentsTrend: 8,
        todayExams: 3,
        monthlyRevenue: 240000,
        revenueTrend: 15
    });
    
    updatePerformanceChart({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        scores: [65, 72, 68, 75, 78, 82, 85]
    });
    
    updateUpcomingTests([
        { name: 'NEST Mock Test 1', subject: 'Physics', duration: 180, date: '2025-12-28' },
        { name: 'IAT Mock Test 2', subject: 'Mathematics', duration: 120, date: '2025-12-29' },
        { name: 'ISI Mock Test 1', subject: 'Statistics', duration: 150, date: '2025-12-30' }
    ]);
    
    updateRecentActivity([
        { icon: 'user-plus', message: 'New student registered: Rahul Sharma', time: '2 hours ago' },
        { icon: 'file-alt', message: 'Test created: NEST Mock Test 3', time: '5 hours ago' },
        { icon: 'check-circle', message: 'Payment received: ₹2,999 from Priya Patel', time: '1 day ago' }
    ]);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}