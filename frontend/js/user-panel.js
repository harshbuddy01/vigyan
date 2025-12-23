document.addEventListener('DOMContentLoaded', () => {
    refreshUserDashboard();
});

async function refreshUserDashboard() {
    const email = localStorage.getItem("userEmail");
    const container = document.getElementById("userDashboardContainer");
    const loginPlaceholder = document.getElementById("navLoginPlaceholder") || document.querySelector('.btn-login');

    if (!email) {
        if (container) container.innerHTML = ""; // Clear if logged out
        return;
    }

    try {
        // Fetch real-time data from your backend
        const res = await axios.get(`${window.API_BASE_URL || 'https://iin-production.up.railway.app'}/api/user-status?email=${email}`);
        const data = res.data;

        // 1. Update Navbar Login Button
        if (loginPlaceholder) {
            loginPlaceholder.outerHTML = `<span class="text-blue-500 font-bold uppercase text-[10px] tracking-widest border-b border-blue-500/50 pb-1">Verified Member</span>`;
        }

        // 2. Update Floating Dialogue Panel (Scenario 3 Dashboard)
        if (container) {
            container.innerHTML = `
                <div class="user-card-floating" style="background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(10px); padding: 1.5rem; border-radius: 1.25rem; border: 1px solid #2d3748; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.5); width: 300px;">
                    <div class="flex items-center gap-4 mb-5">
                        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">S</div>
                        <div>
                            <h4 class="text-white font-black text-[10px] uppercase tracking-widest">Active Profile</h4>
                            <p class="text-gray-400 text-[9px] truncate w-32">${data.email}</p>
                        </div>
                    </div>
                    <div class="bg-black/20 rounded-xl p-3 mb-5 space-y-2">
                        <div class="flex justify-between text-[10px] font-bold uppercase"><span class="text-gray-500">Roll:</span><span class="text-blue-400">${data.rollNumber}</span></div>
                        <div class="flex justify-between text-[10px] font-bold uppercase"><span class="text-gray-500">Status:</span><span class="text-green-500">Secured ✅</span></div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        ${data.tests.map(t => `<span class="bg-blue-600/10 text-blue-400 border border-blue-400/20 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest">${t}</span>`).join('')}
                    </div>
                    <button onclick="handleLogout()" class="w-full mt-6 text-[9px] text-gray-500 hover:text-red-500 font-black uppercase tracking-widest transition-colors duration-300">Terminate Session</button>
                </div>`;
        }
    } catch (e) {
        console.log("No active session found on server.");
    }
}

window.handleLogout = function() {
    localStorage.clear();
    window.location.href = "index.html";
}