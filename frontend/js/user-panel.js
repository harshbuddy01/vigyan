document.addEventListener("DOMContentLoaded", () => {
  if (window.refreshUserDashboard) window.refreshUserDashboard();
});

window.refreshUserDashboard = async function () {
  const email = localStorage.getItem("userEmail");
  if (!email) return;

  try {
    const base = window.API_BASE_URL || "https://iin-production.up.railway.app";
    const res = await axios.get(`${base}/api/user-status?email=${email}`);
    const data = res.data;

    // Replace login button with profile icon + dropdown
    const navPlaceholder = document.getElementById("navLoginPlaceholder");
    if (!navPlaceholder) return;

    navPlaceholder.innerHTML = `
      <div class="relative">
        <button id="profileButton" class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg focus:outline-none">
          <span class="text-white font-bold text-sm">${(data.email[0] || "S").toUpperCase()}</span>
        </button>
        <div id="profileDropdown" class="hidden absolute right-0 mt-3 w-72 bg-[#020617] border border-white/10 rounded-2xl shadow-2xl p-4 z-50">
          <div class="mb-4">
            <p class="text-xs text-gray-400 uppercase font-bold">Signed in as</p>
            <p class="text-sm text-white font-semibold truncate">${data.email}</p>
            <p class="text-[11px] text-blue-400 mt-1 font-semibold">Roll No: ${data.rollNumber}</p>
          </div>
          <div class="border-t border-white/10 pt-3 mb-3">
            <p class="text-[11px] text-gray-400 uppercase font-bold mb-2">Purchased Tests</p>
            ${data.tests.map(t => `
              <div class="flex items-center justify-between text-xs mb-2">
                <span class="${t === "iat" ? "text-green-400" : "text-red-400"} font-semibold">
                  ${t.toUpperCase()} Series
                </span>
                ${t === "iat" ? "" : '<span class="text-[10px] text-gray-500 px-2 py-1 rounded-full border border-gray-600">Buy Now</span>'}
              </div>
            `).join("")}
          </div>
          <button id="logoutBtn" class="w-full py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
            Logout
          </button>
        </div>
      </div>
    `;

    // Toggle dropdown
    const btn = document.getElementById("profileButton");
    const dropdown = document.getElementById("profileDropdown");
    if (btn && dropdown) {
      btn.addEventListener("click", () => {
        dropdown.classList.toggle("hidden");
      });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
      });
    }
  } catch (e) {
    console.log("User panel not initialized.", e);
  }
};
