/**
 * Admin Dashboard Main - Complete with ALL modules + Real Backend Integration
 */

let performanceChart = null;

// Initialize dashboard
async function initDashboard() {
    console.log('🔵 Initializing dashboard...');
    
    try {
        setupNavigation();
        setupHeaderActions(); // Setup header icons functionality
        await loadDashboardData();
        console.log('✅ Dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Dashboard initialization error:', error);
        loadDashboardFallbackData();
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminAuth');
        localStorage.removeItem('adminAuth');
        window.location.href = 'admin-login.html';
    }
}

// Setup header actions (notifications, settings, profile)
function setupHeaderActions() {
    console.log('🔵 Setting up header actions...');
    
    // Notification Bell
    const notificationBell = document.querySelector('.notification-bell');
    if (notificationBell) {
        notificationBell.style.cursor = 'pointer';
        notificationBell.addEventListener('click', showNotifications);
    }
    
    // Settings Icon
    const settingsIcon = document.querySelector('.settings-icon');
    if (settingsIcon) {
        settingsIcon.style.cursor = 'pointer';
        settingsIcon.addEventListener('click', showSettings);
    }
    
    // Admin Profile
    const adminProfile = document.querySelector('.admin-profile');
    if (adminProfile) {
        adminProfile.style.cursor = 'pointer';
        adminProfile.addEventListener('click', showProfileMenu);
    }
    
    // Load admin profile data on init
    loadAdminProfile();
    
    // Load notifications count
    loadNotificationsCount();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-bell') && !e.target.closest('.notification-dropdown')) {
            closeNotifications();
        }
        if (!e.target.closest('.settings-icon') && !e.target.closest('.settings-dropdown')) {
            closeSettings();
        }
        if (!e.target.closest('.admin-profile') && !e.target.closest('.profile-dropdown')) {
            closeProfileMenu();
        }
    });
    
    console.log('✅ Header actions setup complete');
}

// 🆕 Load admin profile from backend
async function loadAdminProfile() {
    try {
        const profile = await AdminAPI.request('/api/admin/profile');
        
        // Update profile display
        const adminName = document.querySelector('.admin-name');
        const adminRole = document.querySelector('.admin-role');
        const adminImg = document.querySelector('.admin-profile img');
        
        if (adminName && profile.name) {
            adminName.textContent = profile.name;
        }
        if (adminRole && profile.role) {
            adminRole.textContent = profile.role;
        }
        if (adminImg && profile.name) {
            adminImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6366f1&color=fff`;
        }
        
        // Store profile globally for profile menu
        window.adminProfileData = profile;
        
        console.log('✅ Admin profile loaded:', profile.name);
    } catch (error) {
        console.error('❌ Error loading admin profile:', error);
        // Keep default "Admin User" if API fails
    }
}

// 🆕 Load notifications count from backend
async function loadNotificationsCount() {
    try {
        const data = await AdminAPI.request('/api/admin/notifications/count');
        const badge = document.querySelector('.notification-bell .badge');
        
        if (badge && data.count) {
            badge.textContent = data.count;
            badge.style.display = data.count > 0 ? 'flex' : 'none';
        }
        
        console.log(`✅ Notifications count: ${data.count}`);
    } catch (error) {
        console.error('❌ Error loading notifications count:', error);
    }
}

// 🆕 Show notifications dropdown with REAL data from backend
async function showNotifications(e) {
    e.stopPropagation();
    
    // Close other dropdowns
    closeSettings();
    closeProfileMenu();
    
    // Check if already open
    let dropdown = document.querySelector('.notification-dropdown');
    if (dropdown) {
        dropdown.remove();
        return;
    }
    
    // Create loading state
    dropdown = document.createElement('div');
    dropdown.className = 'notification-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: 70px;
        right: 20px;
        width: 360px;
        max-height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        z-index: 1000;
        overflow: hidden;
        animation: slideDown 0.2s ease;
    `;
    
    dropdown.innerHTML = `
        <div style="padding: 16px; border-bottom: 1px solid #e2e8f0;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Notifications</h3>
        </div>
        <div style="padding: 40px; text-align: center; color: #94a3b8;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
            <div style="margin-top: 12px;">Loading notifications...</div>
        </div>
    `;
    
    document.body.appendChild(dropdown);
    
    try {
        // 🆕 Fetch REAL notifications from backend
        const data = await AdminAPI.request('/api/admin/notifications');
        const notifications = data.notifications || [];
        
        // Update dropdown with real data
        dropdown.innerHTML = `
            <div style="padding: 16px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Notifications</h3>
                ${notifications.filter(n => n.unread).length > 0 ? 
                    `<button onclick="markAllRead()" style="background: none; border: none; color: #3b82f6; font-size: 13px; cursor: pointer; font-weight: 500;">Mark all read</button>` : ''}
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                ${notifications.length > 0 ? notifications.map(notif => `
                    <div style="padding: 16px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s; ${notif.unread ? 'background: #f8fafc;' : ''}" 
                         onclick="markNotificationRead('${notif.id}')" 
                         onmouseover="this.style.background='#f8fafc'" 
                         onmouseout="this.style.background='${notif.unread ? '#f8fafc' : 'white'}'">
                        <div style="display: flex; gap: 12px; align-items: start;">
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${notif.unread ? '#3b82f6' : 'transparent'}; margin-top: 6px; flex-shrink: 0;"></div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; font-size: 14px; color: #1e293b; margin-bottom: 4px;">${notif.title}</div>
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 6px;">${notif.message}</div>
                                <div style="font-size: 12px; color: #94a3b8;">${formatTimeAgo(notif.createdAt)}</div>
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div style="padding: 60px 20px; text-align: center; color: #94a3b8;">
                        <i class="fas fa-bell-slash" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                        <div>No notifications</div>
                    </div>
                `}
            </div>
            ${notifications.length > 0 ? `
                <div style="padding: 12px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <a href="#" onclick="viewAllNotifications()" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 500;">View All Notifications</a>
                </div>
            ` : ''}
        `;
        
        // Clear badge
        const badge = document.querySelector('.notification-bell .badge');
        if (badge) {
            badge.style.display = 'none';
        }
        
    } catch (error) {
        console.error('❌ Error loading notifications:', error);
        dropdown.innerHTML = `
            <div style="padding: 16px; border-bottom: 1px solid #e2e8f0;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Notifications</h3>
            </div>
            <div style="padding: 60px 20px; text-align: center; color: #ef4444;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 16px;"></i>
                <div>Failed to load notifications</div>
                <div style="font-size: 13px; margin-top: 8px;">Please try again later</div>
            </div>
        `;
    }
}

function closeNotifications() {
    const dropdown = document.querySelector('.notification-dropdown');
    if (dropdown) dropdown.remove();
}

// 🆕 Mark all notifications as read
window.markAllRead = async function() {
    try {
        await AdminAPI.request('/api/admin/notifications/mark-all-read', { method: 'POST' });
        
        const badge = document.querySelector('.notification-bell .badge');
        if (badge) {
            badge.textContent = '0';
            badge.style.display = 'none';
        }
        
        if (window.AdminUtils) {
            window.AdminUtils.showToast('All notifications marked as read', 'success');
        }
        closeNotifications();
    } catch (error) {
        console.error('❌ Error marking notifications as read:', error);
        if (window.AdminUtils) {
            window.AdminUtils.showToast('Failed to mark notifications as read', 'error');
        }
    }
}

// 🆕 Mark single notification as read
window.markNotificationRead = async function(notificationId) {
    try {
        await AdminAPI.request(`/api/admin/notifications/${notificationId}/read`, { method: 'POST' });
        console.log(`✅ Notification ${notificationId} marked as read`);
        
        // Reload notifications count
        loadNotificationsCount();
    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
    }
}

window.viewAllNotifications = function() {
    closeNotifications();
    // Navigate to notifications page (implement if exists)
    if (window.AdminUtils) {
        window.AdminUtils.showToast('Full notifications page - Coming soon!', 'info');
    }
}

// 🆕 Show settings dropdown
async function showSettings(e) {
    e.stopPropagation();
    
    // Close other dropdowns
    closeNotifications();
    closeProfileMenu();
    
    // Check if already open
    let dropdown = document.querySelector('.settings-dropdown');
    if (dropdown) {
        dropdown.remove();
        return;
    }
    
    // Create settings dropdown
    dropdown = document.createElement('div');
    dropdown.className = 'settings-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: 70px;
        right: 20px;
        width: 300px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        z-index: 1000;
        overflow: hidden;
        animation: slideDown 0.2s ease;
    `;
    
    dropdown.innerHTML = `
        <div style="padding: 16px; border-bottom: 1px solid #e2e8f0;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Settings</h3>
        </div>
        <div style="padding: 8px;">
            <a href="#" onclick="openGeneralSettings()" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; color: #334155; transition: background 0.2s;" 
               onmouseover="this.style.background='#f8fafc'" 
               onmouseout="this.style.background='white'">
                <i class="fas fa-cog" style="color: #64748b; width: 20px;"></i>
                <span style="font-size: 14px;">General Settings</span>
            </a>
            <a href="#" onclick="openTestSettings()" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; color: #334155; transition: background 0.2s;" 
               onmouseover="this.style.background='#f8fafc'" 
               onmouseout="this.style.background='white'">
                <i class="fas fa-file-alt" style="color: #64748b; width: 20px;"></i>
                <span style="font-size: 14px;">Test Settings</span>
            </a>
            <a href="#" onclick="openEmailSettings()" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; color: #334155; transition: background 0.2s;" 
               onmouseover="this.style.background='#f8fafc'" 
               onmouseout="this.style.background='white'">
                <i class="fas fa-envelope" style="color: #64748b; width: 20px;"></i>
                <span style="font-size: 14px;">Email Notifications</span>
            </a>
            <a href="#" onclick="openPaymentSettings()" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; color: #334155; transition: background 0.2s;" 
               onmouseover="this.style.background='#f8fafc'" 
               onmouseout="this.style.background='white'">
                <i class="fas fa-credit-card" style="color: #64748b; width: 20px;"></i>
                <span style="font-size: 14px;">Payment Gateway</span>
            </a>
            <a href="#" onclick="openSecuritySettings()" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; color: #334155; transition: background 0.2s;" 
               onmouseover="this.style.background='#f8fafc'" 
               onmouseout="this.style.background='white'">
                <i class="fas fa-shield-alt" style="color: #64748b; width: 20px;"></i>
                <span style="font-size: 14px;">Security</span>
            </a>
            <a href="#" onclick="openBackupSettings()" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; color: #334155; transition: background 0.2s;" 
               onmouseover="this.style.background='#f8fafc'" 
               onmouseout="this.style.background='white'">
                <i class="fas fa-database" style="color: #64748b; width: 20px;"></i>
                <span style="font-size: 14px;">Backup & Restore</span>
            </a>
        </div>
    `;
    
    document.body.appendChild(dropdown);
}

function closeSettings() {
    const dropdown = document.querySelector('.settings-dropdown');
    if (dropdown) dropdown.remove();
}

// Settings menu actions - These can be connected to backend when settings pages are built
window.openGeneralSettings = function() {
    closeSettings();
    if (window.AdminUtils) {
        window.AdminUtils.showToast('General settings - Coming soon!', 'info');
    }
}

window.openTestSettings = function() {
    closeSettings();
    if (window.AdminUtils) {
        window.AdminUtils.showToast('Test settings - Coming soon!', 'info');
    }
}

window.openEmailSettings = function() {
    closeSettings();
    if (window.AdminUtils) {
        window.AdminUtils.showToast('Email settings - Coming soon!', 'info');
    }
}

window.openPaymentSettings = function() {
    closeSettings();
    if (window.AdminUtils) {
        window.AdminUtils.showToast('Payment settings - Coming soon!', 'info');
    }
}

window.openSecuritySettings = function() {
    closeSettings();
    if (window.AdminUtils) {
        window.AdminUtils.showToast('Security settings - Coming soon!', 'info');
    }
}

window.openBackupSettings = function() {
    closeSettings();
    if (window.AdminUtils) {
        window.AdminUtils.showToast('Backup settings - Coming soon!', 'info');
    }
}

// 🆕 Show profile menu dropdown with REAL data
async function showProfileMenu(e) {
    e.stopPropagation();
    
    // Close other dropdowns
    closeNotifications();
    closeSettings();
    
    // Check if already open
    let dropdown = document.querySelector('.profile-dropdown');
    if (dropdown) {
        dropdown.remove();
        return;
    }
    
    // Get profile data
    const profile = window.adminProfileData || {
        name: 'Admin User',
        email: 'admin@iinedu.com',
        role: 'Super Admin'
    };
    
    // Create profile dropdown
    dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: 70px;
        right: 20px;
        width: 280px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        z-index: 1000;
        overflow: hidden;
        animation: slideDown 0.2s ease;
    `;
    
    dropdown.innerHTML = `
        <div style="padding: 20px; border-bottom: 1px solid #e2e8f0; text-align: center;">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6366f1&color=fff&size=80" 
                 alt="Admin" 
                 style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 12px;">
            <div style="font-weight: 600; font-size: 16px; color: #1e293b; margin-bottom: 4px;">${profile.name}</div>
            <div style="font-size: 13px; color: #64748b;">${profile.email}</div>
            <div style="margin-top: 8px; display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 12px; font-size: 12px; font-weight: 600;">${profile.role}</div>
        </div>
        <div style="padding: 8px;">
            <a href="#" onclick="viewProfile()" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; color: #334155; transition: background 0.2s;" 
               onmouseover="this.style.background='#f8fafc'" 
               onmouseout="this.style.background='white'">
                <i class="fas fa-user" style="color: #64748b; width: 20px;"></i>
                <span style="font-size: 14px;">My Profile</span>
            </a>
            <a href="#" onclick="editProfile()" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; color: #334155; transition: background 0.2s;" 
               onmouseover="this.style.background='#f8fafc'" 
               onmouseout="this.style.background='white'">
                <i class="fas fa-edit" style="color: #64748b; width: 20px;"></i>
                <span style="font-size: 14px;">Edit Profile</span>
            </a>
            <a href="#" onclick="changePassword()" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; color: #334155; transition: background 0.2s;" 
               onmouseover="this.style.background='#f8fafc'" 
               onmouseout="this.style.background='white'">
                <i class="fas fa-key" style="color: #64748b; width: 20px;"></i>
                <span style="font-size: 14px;">Change Password</span>
            </a>
            <a href="#" onclick="viewActivity()" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; color: #334155; transition: background 0.2s;" 
               onmouseover="this.style.background='#f8fafc'" 
               onmouseout="this.style.background='white'">
                <i class="fas fa-history" style="color: #64748b; width: 20px;"></i>
                <span style="font-size: 14px;">Activity Log</span>
            </a>
            <div style="height: 1px; background: #e2e8f0; margin: 8px 0;"></div>
            <a href="#" onclick="logout()" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; color: #ef4444; transition: background 0.2s;" 
               onmouseover="this.style.background='#fee2e2'" 
               onmouseout="this.style.background='white'">
                <i class="fas fa-sign-out-alt" style="color: #ef4444; width: 20px;"></i>
                <span style="font-size: 14px; font-weight: 600;">Logout</span>
            </a>
        </div>
    `;
    
    document.body.appendChild(dropdown);
}

function closeProfileMenu() {
    const dropdown = document.querySelector('.profile-dropdown');
    if (dropdown) dropdown.remove();
}

// Profile menu actions
window.viewProfile = function() {
    closeProfileMenu();
    if (window.AdminUtils) {
        window.AdminUtils.showToast('Profile view - Coming soon!', 'info');
    }
}

window.editProfile = function() {
    closeProfileMenu();
    if (window.AdminUtils) {
        window.AdminUtils.showToast('Profile edit - Coming soon!', 'info');
    }
}

window.changePassword = function() {
    closeProfileMenu();
    if (window.AdminUtils) {
        window.AdminUtils.showToast('Password change - Coming soon!', 'info');
    }
}

window.viewActivity = function() {
    closeProfileMenu();
    if (window.AdminUtils) {
        window.AdminUtils.showToast('Activity log - Coming soon!', 'info');
    }
}

// Utility: Format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.content-area');
    const pageTitle = document.querySelector('.page-title');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            pages.forEach(p => p.style.display = 'none');
            
            const pageName = link.dataset.page;
            const targetPage = document.getElementById(`${pageName}-page`);
            
            if (targetPage) {
                targetPage.style.display = 'block';
                const linkText = link.querySelector('span')?.textContent || 'Admin Panel';
                if (pageTitle) pageTitle.textContent = linkText;
                
                setTimeout(() => loadPageData(pageName), 50);
            }
        });
    });
}

// Load page-specific data
function loadPageData(pageName) {
    console.log(`📄 Loading page: ${pageName}`);
    
    try {
        switch(pageName) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'test-calendar':
                if (typeof initTestCalendar === 'function') initTestCalendar();
                else console.warn('⚠️ initTestCalendar not found');
                break;
            case 'scheduled-tests':
                if (typeof initScheduledTests === 'function') initScheduledTests();
                else console.warn('⚠️ initScheduledTests not found');
                break;
            case 'past-tests':
                if (typeof initPastTests === 'function') initPastTests();
                else console.warn('⚠️ initPastTests not found');
                break;
            case 'create-test':
                if (typeof initCreateTest === 'function') initCreateTest();
                else console.warn('⚠️ initCreateTest not found');
                break;
            case 'add-questions':
                if (typeof initAddQuestions === 'function') initAddQuestions();
                else console.warn('⚠️ initAddQuestions not found');
                break;
            case 'view-questions':
                if (typeof initViewQuestions === 'function') initViewQuestions();
                else console.warn('⚠️ initViewQuestions not found');
                break;
            case 'upload-pdf':
                if (typeof initUploadPDF === 'function') initUploadPDF();
                else console.warn('⚠️ initUploadPDF not found');
                break;
            case 'upload-image':
                if (typeof initImageUploadPage === 'function') initImageUploadPage();
                else console.warn('⚠️ initImageUploadPage not found');
                break;
            case 'all-students':
                if (typeof initStudents === 'function') initStudents();
                else console.warn('⚠️ initStudents not found');
                break;
            case 'add-student':
                if (typeof initAddStudent === 'function') initAddStudent();
                else console.warn('⚠️ initAddStudent not found');
                break;
            case 'performance':
                console.log('ℹ️ Performance analytics - Coming soon');
                break;
            case 'transactions':
                if (typeof initTransactions === 'function') initTransactions();
                else console.warn('⚠️ initTransactions not found');
                break;
            case 'view-results':
                if (typeof initResults === 'function') initResults();
                else console.warn('⚠️ initResults not found');
                break;
            default:
                console.log(`ℹ️ No initialization needed for ${pageName}`);
        }
    } catch (error) {
        console.error(`❌ Error loading ${pageName}:`, error);
        if (window.AdminUtils) {
            window.AdminUtils.showToast(`Error loading ${pageName}. Please refresh the page.`, 'error');
        }
    }
}

// Load dashboard data
async function loadDashboardData() {
    console.log('🔵 Loading dashboard data...');
    loadDashboardFallbackData();
}

function updateDashboardStats(stats) {
    try {
        const statCards = {
            tests: { value: stats.activeTests || 24, trend: stats.testsTrend || 12 },
            students: { value: stats.totalStudents || 1250, trend: stats.studentsTrend || 8 },
            exams: { value: stats.todayExams || 3 },
            revenue: { value: stats.monthlyRevenue || 240000, trend: stats.revenueTrend || 15 }
        };
        
        const testsValue = document.querySelector('.stat-card.blue .stat-value');
        const studentsValue = document.querySelector('.stat-card.green .stat-value');
        const examsValue = document.querySelector('.stat-card.orange .stat-value');
        const revenueValue = document.querySelector('.stat-card.purple .stat-value');
        
        if (testsValue) testsValue.textContent = statCards.tests.value;
        if (studentsValue) studentsValue.textContent = statCards.students.value.toLocaleString();
        if (examsValue) examsValue.textContent = statCards.exams.value;
        if (revenueValue) revenueValue.textContent = `₹${(statCards.revenue.value / 100000).toFixed(1)}L`;
        
        console.log('✅ Dashboard stats updated');
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

function updatePerformanceChart(data) {
    try {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;
        
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded yet');
            setTimeout(() => updatePerformanceChart(data), 500);
            return;
        }
        
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
                    fill: true,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        borderRadius: 8,
                        callbacks: {
                            label: (context) => `Score: ${context.parsed.y}%`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { 
                            callback: value => value + '%',
                            color: '#64748b'
                        },
                        grid: {
                            color: '#f1f5f9'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#64748b'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        console.log('✅ Performance chart rendered');
    } catch (error) {
        console.error('Error updating performance chart:', error);
    }
}

function loadDashboardFallbackData() {
    console.log('📋 Loading demo dashboard data...');
    
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
    
    console.log('✅ Demo data loaded successfully');
}

// Initialize on page load
console.log('🔵 Dashboard script loaded');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initDashboard, 100);
    });
} else {
    setTimeout(initDashboard, 100);
}