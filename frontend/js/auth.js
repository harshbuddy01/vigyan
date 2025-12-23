// ============================================
// UNIFIED AUTH & USER PANEL SYSTEM
// Works across all pages automatically
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeNavbarAuth();
});

function initializeNavbarAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail');
    const rollNumber = localStorage.getItem('userToken');
    const purchasedTests = JSON.parse(localStorage.getItem('purchasedTests') || '[]');

    // Find the login button (works with any naming convention)
    const loginBtn = document.querySelector('.btn-login') || 
                     document.querySelector('.login-btn') || 
                     document.getElementById('loginBtn');
    
    const navLinks = document.querySelector('.nav-links');

    if (isLoggedIn === 'true' && userEmail && navLinks) {
        // Remove the old login button
        if (loginBtn) {
            loginBtn.remove();
        }

        // Create the user panel dropdown
        const userPanelHTML = createUserPanelHTML(userEmail, rollNumber, purchasedTests);
        
        // Insert the user panel at the end of nav-links
        navLinks.insertAdjacentHTML('beforeend', userPanelHTML);
        
        // Attach event listeners
        attachUserPanelListeners();
    }
}

function createUserPanelHTML(email, rollNo, purchasedTests) {
    // Check which tests are purchased
    const hasIAT = purchasedTests.includes('IAT Series') || purchasedTests.includes('iat');
    const hasNEST = purchasedTests.includes('NEST Series') || purchasedTests.includes('nest');
    const hasISI = purchasedTests.includes('ISI Series') || purchasedTests.includes('isi');

    return `
        <div class="user-dropdown-container">
            <button class="user-icon-btn" id="userIconBtn">
                <i class="fas fa-user-circle"></i>
            </button>
            <div class="user-dropdown-panel" id="userDropdownPanel">
                <div class="user-panel-header">
                    <div class="user-email-display">
                        <i class="fas fa-envelope"></i>
                        <span>${email}</span>
                    </div>
                    <div class="user-roll-display">
                        <i class="fas fa-id-badge"></i>
                        <span>Roll No: ${rollNo || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="divider"></div>
                
                <div class="purchased-tests-section">
                    <h4>📚 Purchased Tests</h4>
                    <div class="test-item ${hasIAT ? 'purchased' : 'not-purchased'}">
                        ${hasIAT ? '✅' : '❌'} IAT Series
                        ${!hasIAT ? '<a href="testfirstpage.html" class="buy-link">(Buy Now)</a>' : ''}
                    </div>
                    <div class="test-item ${hasNEST ? 'purchased' : 'not-purchased'}">
                        ${hasNEST ? '✅' : '❌'} NEST Series
                        ${!hasNEST ? '<a href="testfirstpage.html" class="buy-link">(Buy Now)</a>' : ''}
                    </div>
                    <div class="test-item ${hasISI ? 'purchased' : 'not-purchased'}">
                        ${hasISI ? '✅' : '❌'} ISI Series
                        ${!hasISI ? '<a href="testfirstpage.html" class="buy-link">(Buy Now)</a>' : ''}
                    </div>
                </div>
                
                <div class="divider"></div>
                
                <button class="logout-btn-panel" onclick="handleLogout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    `;
}

function attachUserPanelListeners() {
    const userBtn = document.getElementById('userIconBtn');
    const dropdown = document.getElementById('userDropdownPanel');

    if (userBtn && dropdown) {
        // Toggle dropdown on button click
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown-container')) {
                dropdown.classList.remove('show');
            }
        });
    }
}

// Global logout function
window.handleLogout = function() {
    // Clear all user data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('purchasedTests');
    
    // Redirect to homepage
    window.location.href = 'index.html';
}

// Legacy support - keep old function name for backward compatibility
window.triggerLogout = window.handleLogout;