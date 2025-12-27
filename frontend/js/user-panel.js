// ============================================
// SIMPLE USER PANEL - LOCALHOST ONLY (NO BACKEND VERIFICATION)
// Reads from localStorage and renders user panel with calendar link
// ============================================

console.log('📦 User Panel v3.0 - Simple localStorage-only version');

// Main render function - reads from localStorage and displays panel
window.renderUserPanelDirect = function(userData) {
  console.log('⚡ Rendering user panel with data:', userData);
  
  const navPlaceholder = document.getElementById("navLoginPlaceholder");
  if (!navPlaceholder) {
    console.warn('⚠️ navLoginPlaceholder not found in DOM');
    return;
  }
  
  const email = userData.email || '';
  const rollNumber = userData.rollNumber || 'N/A';
  const tests = userData.tests || [];
  
  console.log('📊 Panel data:', { email, rollNumber, tests });
  
  // Render user panel
  navPlaceholder.innerHTML = `
    <div class="relative">
      <button id="profileButton" class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg focus:outline-none hover:scale-110 transition-transform">
        <span class="text-white font-bold text-sm">${(email[0] || "U").toUpperCase()}</span>
      </button>
      <div id="profileDropdown" class="hidden absolute right-0 mt-3 w-72 bg-[#020617] border border-white/10 rounded-2xl shadow-2xl p-4 z-50">
        <div class="mb-4">
          <p class="text-xs text-gray-400 uppercase font-bold">Signed in as</p>
          <p class="text-sm text-white font-semibold truncate">${email}</p>
          <p class="text-[11px] text-blue-400 mt-1 font-semibold">Roll No: ${rollNumber}</p>
        </div>
        
        ${tests.length > 0 ? `
          <a href="student-calendar.html" class="block mb-3 p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl hover:border-green-500/50 transition group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                <i class="fas fa-calendar-alt text-green-400 text-lg"></i>
              </div>
              <div class="flex-1">
                <p class="text-white font-bold text-sm">📅 My Test Calendar</p>
                <p class="text-gray-400 text-[11px]">View upcoming tests</p>
              </div>
              <i class="fas fa-chevron-right text-gray-500 text-xs"></i>
            </div>
          </a>
        ` : ''}
        
        <div class="border-t border-white/10 pt-3 mb-3">
          <p class="text-[11px] text-gray-400 uppercase font-bold mb-2">Purchased Tests</p>
          ${tests.length > 0 ? tests.map(t => `
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="${
                t === "iat" ? "text-green-400" : 
                t === "nest" ? "text-purple-400" : 
                t === "isi" ? "text-pink-400" : 
                "text-blue-400"
              } font-semibold">
                <i class="fas fa-check-circle mr-1"></i> ${t.toUpperCase()} Series
              </span>
            </div>
          `).join("") : '<p class="text-xs text-gray-500">No tests purchased</p>'}
        </div>
        <button id="logoutBtn" class="w-full py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
          <i class="fas fa-sign-out-alt mr-2"></i> Logout
        </button>
      </div>
    </div>
  `;
  
  attachProfileEventListeners();
  console.log('✅ User panel rendered successfully!');
};

// Simple function - just reads localStorage and renders (NO BACKEND CALLS)
window.refreshUserDashboard = function() {
  console.log('🔄 refreshUserDashboard called');
  
  const email = localStorage.getItem("userEmail");
  const rollNumber = localStorage.getItem("userRollNumber");
  const purchasedTests = localStorage.getItem("purchasedTests");
  
  console.log('📂 localStorage data:', { email, rollNumber, purchasedTests });
  
  if (email && rollNumber) {
    const tests = purchasedTests ? JSON.parse(purchasedTests) : [];
    
    window.renderUserPanelDirect({
      email: email,
      rollNumber: rollNumber,
      tests: tests
    });
  } else {
    console.log('ℹ️ User not logged in (missing email or rollNumber)');
  }
};

// Attach event listeners
function attachProfileEventListeners() {
  const btn = document.getElementById("profileButton");
  const dropdown = document.getElementById("profileDropdown");
  const logoutBtn = document.getElementById("logoutBtn");
  
  if (btn && dropdown) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("hidden");
    });
    
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      console.log('🚪 Logging out...');
      localStorage.clear();
      window.location.href = "index.html";
    });
  }
}

// Initialize on page load
function initUserPanel() {
  console.log('🚀 Initializing user panel...');
  if (window.refreshUserDashboard) {
    window.refreshUserDashboard();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUserPanel);
} else {
  initUserPanel();
}

window.addEventListener('load', initUserPanel);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    refreshUserDashboard: window.refreshUserDashboard,
    renderUserPanelDirect: window.renderUserPanelDirect
  };
}