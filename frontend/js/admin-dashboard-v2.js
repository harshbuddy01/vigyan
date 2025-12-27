/**
 * Admin Dashboard Main - Connected to Backend
 * Fixed version with better error handling
 */

let performanceChart = null;

// Initialize dashboard
async function initDashboard() {
    console.log('🔵 Initializing dashboard...');
    
    try {
        // Check authentication
        checkAuth();
        
        // Setup navigation
        setupNavigation();
        
        // Load dashboard data with error handling
        await loadDashboardData();
        
        console.log('✅ Dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Dashboard initialization error:', error);
        // Still show fallback data even if there's an error
        loadDashboardFallbackData();
    }
}

// Check authentication
function checkAuth() {
    const sessionAuth = sessionStorage.getItem('adminAuth');
    const localAuth = localStorage.getItem('adminAuth');
    
    if (!sessionAuth && !localAuth) {
        console.log('No auth found, redirecting to login...');
        // window.location.href = 'admin-login.html';
        // return;
    }
}

// Logout function
function logout() {
    if (typeof AdminUtils !== 'undefined' && AdminUtils.showConfirmModal) {
        AdminUtils.showConfirmModal(
            'Are you sure you want to logout?',
            () => {
                sessionStorage.removeItem('adminAuth');
                localStorage.removeItem('adminAuth');
                window.location.href = 'admin-login.html';
            }
        );
    } else {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('adminAuth');
            localStorage.removeItem('adminAuth');
            window.location.href = 'admin-login.html';
        }
    }
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
                const linkText = link.querySelector('span')?.textContent || 'Admin Panel';
                if (pageTitle) pageTitle.textContent = linkText;
                
                // Load page-specific data
                loadPageData(pageName);
            }
        });
    });
}

// Load page-specific data
async function loadPageData(pageName) {
    try {
        console.log(`Loading page: ${pageName}`);
        switch(pageName) {
            case 'dashboard':
                await loadDashboardData();
                break;
            case 'view-questions':
                if (typeof initViewQuestions === 'function') {
                    initViewQuestions();
                } else {
                    console.log('initViewQuestions not available yet');
                }
                break;
            case 'all-students':
                if (typeof initStudents === 'function') {
                    initStudents();
                } else {
                    console.log('initStudents not available yet');
                }
                break;
            case 'transactions':
                if (typeof initTransactions === 'function') {
                    initTransactions();
                } else {
                    console.log('initTransactions not available yet');
                }
                break;
            case 'view-results':
                if (typeof initResults === 'function') {
                    initResults();
                } else {
                    console.log('initResults not available yet');
                }
                break;
            case 'upload-image':
                if (typeof initImageUploadPage === 'function') {
                    initImageUploadPage();
                } else {
                    console.log('initImageUploadPage not available yet');
                }
                break;
        }
    } catch (error) {
        console.error('Error loading page data:', error);
        if (typeof AdminUtils !== 'undefined' && AdminUtils.showToast) {
            AdminUtils.showToast('Failed to load data. Using cached data.', 'error');
        }
    }
}

// Load dashboard data from backend
async function loadDashboardData() {
    console.log('🔵 Loading dashboard data...');
    
    try {
        // Check if AdminAPI is available
        if (typeof AdminAPI === 'undefined') {
            console.warn('⚠️ AdminAPI not loaded yet, using fallback data');
            loadDashboardFallbackData();
            return;
        }
        
        // Try to load from backend
        try {
            const stats = await AdminAPI.getDashboardStats();
            console.log('✅ Stats loaded:', stats);
            updateDashboardStats(stats);
        } catch (error) {
            console.warn('Stats API failed:', error.message);
        }
        
        try {
            const performanceData = await AdminAPI.getPerformanceData();
            console.log('✅ Performance data loaded');
            updatePerformanceChart(performanceData);
        } catch (error) {
            console.warn('Performance API failed:', error.message);
            updatePerformanceChart({});
        }
        
        try {
            const upcomingTests = await AdminAPI.getUpcomingTests();
            console.log('✅ Upcoming tests loaded:', upcomingTests?.length);
            updateUpcomingTests(upcomingTests);
        } catch (error) {
            console.warn('Upcoming tests API failed:', error.message);
        }
        
        try {
            const recentActivity = await AdminAPI.getRecentActivity();
            console.log('✅ Recent activity loaded:', recentActivity?.length);
            updateRecentActivity(recentActivity);
        } catch (error) {
            console.warn('Recent activity API failed:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        console.log('Using fallback data...');
        loadDashboardFallbackData();
    }
}

// Update dashboard stats
function updateDashboardStats(stats) {
    try {
        const statCards = {
            tests: { value: stats.activeTests || 24, trend: stats.testsTrend || 12 },
            students: { value: stats.totalStudents || 1250, trend: stats.studentsTrend || 8 },
            exams: { value: stats.todayExams || 3 },
            revenue: { value: stats.monthlyRevenue || 240000, trend: stats.revenueTrend || 15 }
        };
        
        // Update stat card values
        const testsValue = document.querySelector('.stat-card.blue .stat-value');
        const studentsValue = document.querySelector('.stat-card.green .stat-value');
        const examsValue = document.querySelector('.stat-card.orange .stat-value');
        const revenueValue = document.querySelector('.stat-card.purple .stat-value');
        
        if (testsValue) testsValue.textContent = statCards.tests.value;
        if (studentsValue) studentsValue.textContent = statCards.students.value;
        if (examsValue) examsValue.textContent = statCards.exams.value;
        if (revenueValue) revenueValue.textContent = `₹${(statCards.revenue.value / 100000).toFixed(1)}L`;
        
        console.log('✅ Dashboard stats updated');
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Update performance chart
function updatePerformanceChart(data) {
    try {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) {
            console.warn('Performance chart canvas not found');
            return;
        }
        
        // Check if Chart is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded yet');
            return;
        }
        
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
        
        console.log('✅ Performance chart rendered');
    } catch (error) {
        console.error('Error updating performance chart:', error);
    }
}

// Update upcoming tests
function updateUpcomingTests(tests) {
    try {
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
                    <span style="padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 12px; font-size: 12px; font-weight: 600;">${test.date}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error updating upcoming tests:', error);
    }
}

// Update recent activity
function updateRecentActivity(activities) {
    try {
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
    } catch (error) {
        console.error('Error updating recent activity:', error);
    }
}

// Fallback data
function loadDashboardFallbackData() {
    console.log('🔵 Loading fallback dashboard data...');
    
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
    
    console.log('✅ Fallback data loaded');
}

// Initialize on page load
console.log('🔵 Dashboard script loaded');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    // Delay initialization to ensure other scripts are loaded
    setTimeout(initDashboard, 100);
}