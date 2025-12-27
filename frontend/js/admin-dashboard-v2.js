// ============================================
// IIN ADMIN DASHBOARD V2 - JAVASCRIPT
// Backend Integration with MongoDB
// ============================================

// API Configuration
const API_BASE_URL = 'https://iin-production.up.railway.app';

// ============================================
// NAVIGATION SYSTEM
// ============================================

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentAreas = document.querySelectorAll('.content-area');
    const pageTitle = document.querySelector('.page-title');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Hide all content areas
            contentAreas.forEach(area => area.style.display = 'none');
            
            // Show selected content area
            const page = link.getAttribute('data-page');
            const targetPage = document.getElementById(page + '-page');
            
            if (targetPage) {
                targetPage.style.display = 'block';
                
                // Update page title
                const linkText = link.querySelector('span').textContent;
                pageTitle.textContent = linkText;
            }
        });
    });
}

// ============================================
// CHART INITIALIZATION
// ============================================

function initPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Dec 20', 'Dec 21', 'Dec 22', 'Dec 23', 'Dec 24', 'Dec 25', 'Dec 26', 'Dec 27'],
            datasets: [
                {
                    label: 'Average Score (%)',
                    data: [65, 68, 72, 70, 75, 78, 76, 80],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Students Attempted',
                    data: [45, 52, 58, 55, 62, 68, 65, 72],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 13,
                            weight: '600',
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    padding: 12,
                    borderColor: '#6366f1',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.dataset.label.includes('Score') 
                                    ? context.parsed.y + '%' 
                                    : context.parsed.y + ' students';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: 'Inter'
                        },
                        color: '#64748b'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: 'Inter'
                        },
                        color: '#64748b'
                    }
                }
            }
        }
    });
    
    // Time period filter buttons
    const timeBtns = document.querySelectorAll('.time-btn');
    timeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            timeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Here you can load different data based on selected period
        });
    });
}

// ============================================
// LOAD DASHBOARD STATS FROM BACKEND
// ============================================

async function loadDashboardStats() {
    try {
        // Fetch total questions count
        const questionsResponse = await fetch(`${API_BASE_URL}/api/admin/questions/count`);
        const questionsData = await questionsResponse.json();
        
        // Fetch students count
        const studentsResponse = await fetch(`${API_BASE_URL}/api/admin/students/count`);
        const studentsData = await studentsResponse.json();
        
        // Fetch results count
        const resultsResponse = await fetch(`${API_BASE_URL}/api/admin/results/count`);
        const resultsData = await resultsResponse.json();
        
        // Update stats cards
        if (questionsData.total) {
            document.querySelector('.stat-card.blue .stat-value').textContent = questionsData.total;
        }
        
        if (studentsData.total) {
            document.querySelector('.stat-card.green .stat-value').textContent = studentsData.total.toLocaleString();
        }
        
        if (resultsData.total) {
            // You can update any other stat card here
        }
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// ============================================
// LOAD UPCOMING TESTS FROM BACKEND
// ============================================

async function loadUpcomingTests() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/tests/upcoming`);
        const data = await response.json();
        
        if (data.success && data.tests) {
            const testList = document.querySelector('.test-list');
            testList.innerHTML = ''; // Clear existing
            
            data.tests.forEach(test => {
                const testDate = new Date(test.examDate);
                const day = testDate.getDate();
                const month = testDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                
                const testItem = `
                    <div class="test-item">
                        <div class="test-date">
                            <div class="date-day">${day}</div>
                            <div class="date-month">${month}</div>
                        </div>
                        <div class="test-details">
                            <h4>${test.testName}</h4>
                            <p><i class="fas fa-clock"></i> ${test.startTime} - ${test.endTime}</p>
                            <p><i class="fas fa-users"></i> ${test.registeredStudents || 0} students registered</p>
                        </div>
                        <div class="test-actions">
                            <button class="action-btn" onclick="editTest('${test._id}')"><i class="fas fa-edit"></i></button>
                            <button class="action-btn" onclick="viewTest('${test._id}')"><i class="fas fa-eye"></i></button>
                            <button class="action-btn danger" onclick="deleteTest('${test._id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                
                testList.innerHTML += testItem;
            });
        }
    } catch (error) {
        console.error('Error loading upcoming tests:', error);
    }
}

// ============================================
// LOAD RECENT ACTIVITY FROM BACKEND
// ============================================

async function loadRecentActivity() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/activity/recent`);
        const data = await response.json();
        
        if (data.success && data.activities) {
            const activityList = document.querySelector('.activity-list');
            activityList.innerHTML = ''; // Clear existing
            
            data.activities.forEach(activity => {
                const timeAgo = getTimeAgo(activity.timestamp);
                const iconClass = getActivityIconClass(activity.type);
                const iconColor = getActivityIconColor(activity.type);
                
                const activityItem = `
                    <div class="activity-item">
                        <div class="activity-icon ${iconColor}">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="activity-content">
                            <p>${activity.message}</p>
                            <span class="time">${timeAgo}</span>
                        </div>
                    </div>
                `;
                
                activityList.innerHTML += activityItem;
            });
        }
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now - then) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + ' minutes ago';
    if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
    return Math.floor(diff / 86400) + ' days ago';
}

function getActivityIconClass(type) {
    const icons = {
        'completion': 'fas fa-check-circle',
        'registration': 'fas fa-user-plus',
        'payment': 'fas fa-rupee-sign',
        'upload': 'fas fa-file-upload',
        'schedule': 'fas fa-calendar-plus'
    };
    return icons[type] || 'fas fa-info-circle';
}

function getActivityIconColor(type) {
    const colors = {
        'completion': 'blue',
        'registration': 'green',
        'payment': 'purple',
        'upload': 'orange',
        'schedule': 'blue'
    };
    return colors[type] || 'blue';
}

// ============================================
// TEST MANAGEMENT FUNCTIONS
// ============================================

function editTest(testId) {
    alert('Edit test functionality coming soon! Test ID: ' + testId);
    // Navigate to edit test page
}

function viewTest(testId) {
    alert('View test functionality coming soon! Test ID: ' + testId);
    // Navigate to test details page
}

async function deleteTest(testId) {
    if (!confirm('Are you sure you want to delete this test?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/tests/${testId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Test deleted successfully!');
            loadUpcomingTests(); // Reload the list
        } else {
            alert('Error deleting test: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting test:', error);
        alert('Failed to delete test. Please try again.');
    }
}

// ============================================
// LOGOUT FUNCTION
// ============================================

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored credentials
        localStorage.removeItem('adminToken');
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = '/adminlogin.html';
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 IIN Admin Dashboard V2 Initialized');
    
    // Initialize navigation
    initNavigation();
    
    // Initialize chart
    initPerformanceChart();
    
    // Load data from backend
    loadDashboardStats();
    loadUpcomingTests();
    loadRecentActivity();
    
    // Refresh data every 30 seconds
    setInterval(() => {
        loadDashboardStats();
        loadRecentActivity();
    }, 30000);
});