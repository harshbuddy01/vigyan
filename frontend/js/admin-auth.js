/**
 * Admin Authentication Helper
 * Manages admin login, logout, and session verification
 */

class AdminAuth {
    constructor() {
        this.storageKey = 'adminAuth';
    }

    /**
     * Check if admin is authenticated
     */
    isAuthenticated() {
        const sessionAuth = sessionStorage.getItem(this.storageKey);
        const localAuth = localStorage.getItem(this.storageKey);
        return !!(sessionAuth || localAuth);
    }

    /**
     * Get current admin data
     */
    getAdminData() {
        const sessionAuth = sessionStorage.getItem(this.storageKey);
        const localAuth = localStorage.getItem(this.storageKey);
        
        if (sessionAuth) {
            return JSON.parse(sessionAuth);
        }
        if (localAuth) {
            return JSON.parse(localAuth);
        }
        return null;
    }

    /**
     * Save admin session
     */
    saveSession(adminData, remember = false) {
        const dataString = JSON.stringify(adminData);
        sessionStorage.setItem(this.storageKey, dataString);
        
        if (remember) {
            localStorage.setItem(this.storageKey, dataString);
        }
    }

    /**
     * Clear admin session (logout)
     */
    clearSession() {
        sessionStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Redirect to login if not authenticated
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'admin-login.html';
            return false;
        }
        return true;
    }

    /**
     * Logout function
     */
    logout() {
        this.clearSession();
        window.location.href = 'admin-login.html';
    }
}

// Create global instance
window.adminAuth = new AdminAuth();

// Global logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.adminAuth.logout();
    }
}