/**
 * Centralized Configuration File
 * Updated: 2026-01-24
 * Purpose: Hostinger deployment with Node.js backend + Dynamic API_URL injection
 */

window.APP_CONFIG = {
    // Environment detection
    ENVIRONMENT: window.location.hostname.includes('localhost') ? 'development' : 'production',

    // API Base URL - FIXED: Direct Hostinger URL (2026-01-26)
    // DO NOT CHANGE - This is the production backend on Hostinger VPS
    API_BASE_URL: (() => {
        const hostname = window.location.hostname;
        
        // 1. Check for server-injected environment variable first
        if (window.__ENV__ && window.__ENV__.API_URL) {
            return window.__ENV__.API_URL;
        }

        // 2. Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }

        // 3. PRODUCTION: Always use Hostinger backend
        return 'https://backend-vigyanpreap.vigyanprep.com';
    })(),

    // Feature flags
    FEATURES: {
        ENABLE_AUTH: false,  // Set to true when authentication is ready
        ENABLE_REAL_TIME: false,  // WebSocket updates
        ENABLE_IMAGE_UPLOAD: true,
        DEBUG_MODE: window.location.hostname.includes('localhost')
    },

    // API Endpoints
    ENDPOINTS: {
        TESTS: '/api/admin/tests',
        QUESTIONS: '/api/admin/questions',
        STUDENTS: '/api/admin/students',
        TRANSACTIONS: '/api/admin/transactions',
        RESULTS: '/api/admin/results',
        UPLOAD_IMAGE: '/api/admin/upload-image',
        AUTH: '/api/admin/auth'
    },

    // App metadata
    APP_NAME: 'Vigyan.prep Admin Portal',
    VERSION: '1.0.1',
    BUILD_DATE: '2026-01-24',

    // Logging
    log: function (message, type = 'info') {
        if (this.FEATURES.DEBUG_MODE) {
            const emoji = {
                'info': 'ℹ️',
                'success': '✅',
                'warning': '⚠️',
                'error': '❌'
            };
            console.log(`${emoji[type]} [${this.APP_NAME}] ${message}`);
        }
    }
};

// Set global API_BASE_URL for backward compatibility
window.API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

// Log initialization
console.log('🚀 App Configuration Loaded');
console.log('📍 Environment:', window.APP_CONFIG.ENVIRONMENT);
console.log('🌐 API URL:', window.APP_CONFIG.API_BASE_URL);
console.log('🔧 Debug Mode:', window.APP_CONFIG.FEATURES.DEBUG_MODE);
if (typeof window.__ENV__ !== 'undefined') {
    console.log('🔌 Server-injected environment:', window.__ENV__);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.APP_CONFIG;
}