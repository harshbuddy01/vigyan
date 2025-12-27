/**
 * Admin Panel Initialization Script
 * Ensures all modules load in correct order and handles errors gracefully
 */

console.log('🚀 Admin Panel Initializing...');

// Global error handler
window.addEventListener('error', (e) => {
    console.error('❌ Global error:', e.error);
});

// Check if all required libraries are loaded
function checkDependencies() {
    const checks = {
        'Chart.js': typeof Chart !== 'undefined',
        'AdminAPI': typeof AdminAPI !== 'undefined',
        'AdminUtils': typeof AdminUtils !== 'undefined'
    };
    
    console.log('🔍 Dependency Check:');
    Object.entries(checks).forEach(([name, loaded]) => {
        console.log(`  ${loaded ? '✅' : '❌'} ${name}`);
    });
    
    return Object.values(checks).every(v => v);
}

// Initialize with retry logic
let initAttempts = 0;
const maxAttempts = 5;

function attemptInit() {
    initAttempts++;
    console.log(`🔄 Init attempt ${initAttempts}/${maxAttempts}`);
    
    if (checkDependencies()) {
        console.log('✅ All dependencies loaded, starting dashboard...');
        if (typeof initDashboard === 'function') {
            initDashboard();
        } else {
            console.warn('⚠️ initDashboard function not found');
        }
        return true;
    } else {
        if (initAttempts < maxAttempts) {
            console.log('⏳ Waiting for dependencies...');
            setTimeout(attemptInit, 200);
        } else {
            console.error('❌ Failed to load all dependencies after', maxAttempts, 'attempts');
            showLoadingError();
        }
        return false;
    }
}

function showLoadingError() {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#fee2e2;color:#991b1b;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);z-index:10000;max-width:500px;';
    errorDiv.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <div style="font-weight:600;margin-bottom:4px;">Failed to Load Admin Panel</div>
                <div style="font-size:14px;">Please refresh the page or check your internet connection.</div>
                <button onclick="location.reload()" style="margin-top:8px;padding:6px 12px;background:#dc2626;color:white;border:none;border-radius:4px;cursor:pointer;">
                    Refresh Page
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(errorDiv);
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📝 DOM loaded, starting init...');
        setTimeout(attemptInit, 100);
    });
} else {
    console.log('📝 DOM already loaded, starting init...');
    setTimeout(attemptInit, 100);
}

console.log('🏁 Admin init script loaded');
