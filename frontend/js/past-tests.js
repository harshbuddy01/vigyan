/**
 * Past Tests Module - Backend Integration
 * FIXED: 2026-01-25 - Correct API endpoints and better error handling
 */

let pastTests = [];

function initPastTests() {
    console.log('📋 Initializing Past Tests...');
    renderPastTestsPage();
    loadPastTests();
}

function renderPastTestsPage() {
    const container = document.getElementById('past-tests-page');
    if (!container) return;

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div>
                <h1 style="font-size: 28px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-history" style="color: #6366f1;"></i> Past Tests
                </h1>
            </div>
            <button class="btn-primary" onclick="exportReport()">
                <i class="fas fa-download"></i> Export Report
            </button>
        </div>
        
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <div class="stat-card blue">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 60px; height: 60px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-file-alt" style="font-size: 24px; color: #3b82f6;"></i>
                    </div>
                    <div>
                        <div style="font-size: 32px; font-weight: 700; color: #1e293b;" id="totalTests">0</div>
                        <div style="color: #64748b; font-size: 14px;">Total Tests</div>
                    </div>
                </div>
            </div>
            <div class="stat-card green">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 60px; height: 60px; background: rgba(16, 185, 129, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-users" style="font-size: 24px; color: #10b981;"></i>
                    </div>
                    <div>
                        <div style="font-size: 32px; font-weight: 700; color: #1e293b;" id="totalParticipants">0</div>
                        <div style="color: #64748b; font-size: 14px;">Total Participants</div>
                    </div>
                </div>
            </div>
            <div class="stat-card orange">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 60px; height: 60px; background: rgba(245, 158, 11, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-chart-line" style="font-size: 24px; color: #f59e0b;"></i>
                    </div>
                    <div>
                        <div style="font-size: 32px; font-weight: 700; color: #1e293b;" id="avgScore">0%</div>
                        <div style="color: #64748b; font-size: 14px;">Average Score</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
            <select id="yearFilter" style="padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                <option value="all">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
            </select>
            <select id="monthFilter" style="padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                <option value="all">All Months</option>
                <option value="1">January</option>
                <option value="12">December</option>
            </select>
            <select id="subjectFilter" style="padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                <option value="all">All Subjects</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Chemistry">Chemistry</option>
            </select>
            <input type="text" id="testSearch" placeholder="Search tests..." 
                   style="flex: 1; min-width: 200px; padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
        </div>
        
        <div id="testsContainer" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i><br>
                Loading past tests from database...
            </div>
        </div>
    `;

    document.getElementById('yearFilter').addEventListener('change', applyPastTestsFilters);
    document.getElementById('monthFilter').addEventListener('change', applyPastTestsFilters);
    document.getElementById('subjectFilter').addEventListener('change', applyPastTestsFilters);
    document.getElementById('testSearch').addEventListener('input', applyPastTestsFilters);
}

async function loadPastTests() {
    try {
        console.log('🔄 Fetching past tests from backend...');

        // Ensure AdminAPI is available
        if (!window.AdminAPI) {
            throw new Error('AdminAPI service not found');
        }

        // ✅ FIXED: Use AdminAPI service
        const data = await window.AdminAPI.getPastTests();

        // Handle successful response with empty results
        if (!data || (data.success && (!data.results && !data.tests))) {
            console.log('ℹ️ Database returned empty results');
            pastTests = [];
            showEmptyState();
            return;
        }

        pastTests = data.results || data.tests || [];

        console.log(`✅ Loaded ${pastTests.length} past tests from database`);

        updateStats();
        displayPastTests(pastTests);

    } catch (error) {
        console.error('❌ Failed to load past tests:', error);
        showErrorState(error);
    }
}

function showEmptyState() {
    const container = document.getElementById('testsContainer');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 80px 20px; color: #94a3b8; background: white; border-radius: 12px;">
            <i class="fas fa-history" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
            <h3 style="margin: 0 0 12px 0; font-size: 20px; color: #64748b;">No Past Tests Yet</h3>
            <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8;">
                Past tests will appear here after students complete their exams
            </p>
            <button onclick="window.location.href='#create-test'" class="btn-primary">
                <i class="fas fa-plus"></i> Create Your First Test
            </button>
        </div>
    `;

    // Update stats to show zeros
    const totalTestsEl = document.getElementById('totalTests');
    const totalParticipantsEl = document.getElementById('totalParticipants');
    const avgScoreEl = document.getElementById('avgScore');

    if (totalTestsEl) totalTestsEl.textContent = '0';
    if (totalParticipantsEl) totalParticipantsEl.textContent = '0';
    if (avgScoreEl) avgScoreEl.textContent = '0%';
}

async function archiveTest(id) {
    if (confirm('Archive this test?')) {
        try {
            await window.AdminAPI.archivePastTest(id);

            pastTests = pastTests.filter(t => (t.id || t.test_id) != id);
            updateStats();
            applyPastTestsFilters();
            if (window.AdminUtils) window.AdminUtils.showToast('Test archived successfully', 'success');

        } catch (err) {
            console.error('Archive error:', err);
            if (window.AdminUtils) window.AdminUtils.showToast('Failed to archive test', 'error');
        }
    }
}

function exportReport() {
    if (pastTests.length === 0) {
        alert('No past tests to export');
        return;
    }

    alert('Export functionality will generate a detailed Excel/PDF report of all past tests with complete analytics.');
    if (window.AdminUtils) window.AdminUtils.showToast('Preparing export...', 'success');
}

window.initPastTests = initPastTests;
window.archiveTest = archiveTest;
window.exportReport = exportReport;
window.loadPastTests = loadPastTests;