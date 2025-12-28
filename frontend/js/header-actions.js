// Header Actions - Notifications, Profile, Settings
console.log('👋 Initializing header actions...');

const API_BASE_URL = 'https://iin-production.up.railway.app';

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderActions);
} else {
    initHeaderActions();
}

function initHeaderActions() {
    console.log('✅ DOM loaded, setting up header actions...');
    
    // Load admin profile
    loadAdminProfile();
    
    // Load notification count
    loadNotificationCount();
    
    // Setup click handlers
    setupNotificationBell();
    setupSettingsIcon();
    setupProfileDropdown();
    
    console.log('✅ Header actions initialized!');
}

// ========== ADMIN PROFILE ==========
async function loadAdminProfile() {
    try {
        console.log('👤 Fetching admin profile...');
        const response = await fetch(`${API_BASE_URL}/api/admin/profile`);
        const profile = await response.json();
        
        console.log('✅ Admin profile loaded:', profile);
        
        // Update header with real data
        const adminName = document.querySelector('.admin-name');
        const adminRole = document.querySelector('.admin-role');
        const adminImg = document.querySelector('.admin-profile img');
        
        if (adminName) adminName.textContent = profile.name || 'Admin User';
        if (adminRole) adminRole.textContent = profile.role || 'Super Admin';
        if (adminImg && profile.avatar) adminImg.src = profile.avatar;
        
    } catch (error) {
        console.warn('⚠️ Could not load admin profile:', error);
    }
}

// ========== NOTIFICATION COUNT ==========
async function loadNotificationCount() {
    try {
        console.log('📊 Fetching notification count...');
        const response = await fetch(`${API_BASE_URL}/api/admin/notifications/count`);
        const data = await response.json();
        
        console.log(`✅ Notification count: ${data.count}`);
        
        const badge = document.querySelector('.notification-bell .badge');
        if (badge) {
            if (data.count > 0) {
                badge.textContent = data.count > 99 ? '99+' : data.count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.warn('⚠️ Could not load notification count:', error);
    }
}

// ========== NOTIFICATION BELL ==========
function setupNotificationBell() {
    const bell = document.querySelector('.notification-bell');
    if (!bell) {
        console.warn('⚠️ Notification bell not found in DOM');
        return;
    }
    
    console.log('✅ Notification bell found, adding click handler');
    
    bell.addEventListener('click', async (e) => {
        e.stopPropagation();
        console.log('🔔 Bell clicked!');
        
        // Check if dropdown already exists
        let dropdown = document.querySelector('.notifications-dropdown');
        
        if (dropdown) {
            // Toggle existing dropdown
            dropdown.classList.toggle('show');
            console.log('Toggling existing dropdown');
        } else {
            // Create new dropdown
            console.log('Creating new notifications dropdown...');
            dropdown = await createNotificationsDropdown();
            bell.appendChild(dropdown);
            setTimeout(() => dropdown.classList.add('show'), 10);
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('.notifications-dropdown');
        if (dropdown && !bell.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

async function createNotificationsDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'notifications-dropdown';
    dropdown.innerHTML = '<div class="dropdown-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    try {
        // Fetch notifications from backend
        const response = await fetch(`${API_BASE_URL}/api/admin/notifications`);
        const data = await response.json();
        const notifications = data.notifications || [];
        
        console.log(`✅ Loaded ${notifications.length} notifications`);
        
        if (notifications.length === 0) {
            dropdown.innerHTML = '<div class="dropdown-empty"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>';
            return dropdown;
        }
        
        // Build notifications list
        let html = '<div class="dropdown-header"><h3>Notifications</h3><button class="mark-all-read" onclick="markAllNotificationsRead()">Mark all read</button></div><div class="notifications-list">';
        
        notifications.forEach(notif => {
            const time = formatTimeAgo(notif.createdAt);
            const unreadClass = notif.unread ? 'unread' : '';
            html += `
                <div class="notification-item ${unreadClass}" onclick="markNotificationRead('${notif.id}')">
                    <div class="notif-icon ${notif.type || 'info'}">
                        <i class="fas fa-${getNotifIcon(notif.type)}"></i>
                    </div>
                    <div class="notif-content">
                        <h4>${notif.title}</h4>
                        <p>${notif.message}</p>
                        <span class="notif-time">${time}</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        dropdown.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Error loading notifications:', error);
        dropdown.innerHTML = '<div class="dropdown-error"><i class="fas fa-exclamation-triangle"></i><p>Failed to load notifications</p></div>';
    }
    
    return dropdown;
}

function getNotifIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'bell';
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

window.markAllNotificationsRead = async function() {
    try {
        await fetch(`${API_BASE_URL}/api/admin/notifications/mark-all-read`, { method: 'POST' });
        console.log('✅ Marked all notifications as read');
        
        // Reload notifications
        const bell = document.querySelector('.notification-bell');
        const dropdown = bell.querySelector('.notifications-dropdown');
        if (dropdown) dropdown.remove();
        
        // Update count
        loadNotificationCount();
        
        // Recreate dropdown
        const newDropdown = await createNotificationsDropdown();
        bell.appendChild(newDropdown);
        setTimeout(() => newDropdown.classList.add('show'), 10);
    } catch (error) {
        console.error('❌ Error marking all as read:', error);
    }
};

window.markNotificationRead = async function(notifId) {
    try {
        await fetch(`${API_BASE_URL}/api/admin/notifications/${notifId}/read`, { method: 'POST' });
        console.log(`✅ Marked notification ${notifId} as read`);
        loadNotificationCount();
    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
    }
};

// ========== SETTINGS ICON ==========
function setupSettingsIcon() {
    const settings = document.querySelector('.settings-icon');
    if (!settings) {
        console.warn('⚠️ Settings icon not found in DOM');
        return;
    }
    
    console.log('✅ Settings icon found, adding click handler');
    
    settings.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('⚙️ Settings clicked!');
        
        let dropdown = document.querySelector('.settings-dropdown');
        
        if (dropdown) {
            dropdown.classList.toggle('show');
        } else {
            dropdown = createSettingsDropdown();
            settings.appendChild(dropdown);
            setTimeout(() => dropdown.classList.add('show'), 10);
        }
    });
    
    document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('.settings-dropdown');
        if (dropdown && !settings.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

function createSettingsDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'settings-dropdown';
    dropdown.innerHTML = `
        <div class="dropdown-header"><h3>Settings</h3></div>
        <div class="dropdown-menu">
            <a href="#" class="menu-item" onclick="alert('Profile settings coming soon!')">
                <i class="fas fa-user-cog"></i>
                <span>Profile Settings</span>
            </a>
            <a href="#" class="menu-item" onclick="alert('System settings coming soon!')">
                <i class="fas fa-cog"></i>
                <span>System Settings</span>
            </a>
            <a href="#" class="menu-item" onclick="alert('Theme customization coming soon!')">
                <i class="fas fa-palette"></i>
                <span>Appearance</span>
            </a>
            <div class="menu-divider"></div>
            <a href="#" class="menu-item" onclick="alert('Help & Support coming soon!)">
                <i class="fas fa-question-circle"></i>
                <span>Help & Support</span>
            </a>
        </div>
    `;
    return dropdown;
}

// ========== PROFILE DROPDOWN ==========
function setupProfileDropdown() {
    const profile = document.querySelector('.admin-profile');
    if (!profile) {
        console.warn('⚠️ Admin profile not found in DOM');
        return;
    }
    
    console.log('✅ Admin profile found, adding click handler');
    
    profile.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('👤 Profile clicked!');
        
        let dropdown = document.querySelector('.profile-dropdown');
        
        if (dropdown) {
            dropdown.classList.toggle('show');
        } else {
            dropdown = createProfileDropdown();
            profile.appendChild(dropdown);
            setTimeout(() => dropdown.classList.add('show'), 10);
        }
    });
    
    document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('.profile-dropdown');
        if (dropdown && !profile.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

function createProfileDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown';
    dropdown.innerHTML = `
        <div class="dropdown-menu">
            <a href="#" class="menu-item" onclick="alert('Profile page coming soon!')">
                <i class="fas fa-user"></i>
                <span>My Profile</span>
            </a>
            <a href="#" class="menu-item" onclick="alert('Account settings coming soon!')">
                <i class="fas fa-cog"></i>
                <span>Account Settings</span>
            </a>
            <div class="menu-divider"></div>
            <a href="#" class="menu-item danger" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </a>
        </div>
    `;
    return dropdown;
}

console.log('✅ Header actions script loaded!');
