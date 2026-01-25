/**
 * Past Tests Module - Backend Integration
 * FIXED: 2026-01-25 - Fetching from backend instead of hardcoded data
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
        
        // ✅ FIXED: Fetch from backend API
        const response = await fetch(`${window.API_BASE_URL}/api/admin/past-tests`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        pastTests = data.tests || [];
        
        console.log(`✅ Loaded ${pastTests.length} past tests from database`);
        
        updateStats();
        displayPastTests(pastTests);
        
    } catch (error) {
        console.error('❌ Failed to load past tests:', error);
        
        // Show error message
        const container = document.getElementById('testsContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #ef4444;">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 16px;"></i>
                    <p style="font-size: 18px; margin-bottom: 8px;">Failed to load past tests</p>
                    <p style="font-size: 14px; color: #94a3b8;">${error.message}</p>
                    <button onclick="loadPastTests()" class="btn-primary" style="margin-top: 20px;">
                        <i class="fas fa-sync"></i> Retry
                    </button>
                </div>
            `;
        }
    }
}

function updateStats() {
    const totalTests = pastTests.length;
    const totalParticipants = pastTests.reduce((sum, t) => sum + (t.participants || 0), 0);
    const avgScore = totalTests > 0 ? (pastTests.reduce((sum, t) => sum + (t.avgScore || t.avg_score || 0), 0) / totalTests).toFixed(1) : 0;
    
    document.getElementById('totalTests').textContent = totalTests;
    document.getElementById('totalParticipants').textContent = totalParticipants;
    document.getElementById('avgScore').textContent = avgScore + '%';
}

function applyPastTestsFilters() {
    const year = document.getElementById('yearFilter').value;
    const month = document.getElementById('monthFilter').value;
    const subject = document.getElementById('subjectFilter').value;
    const search = document.getElementById('testSearch').value.toLowerCase();
    
    let filtered = pastTests;
    
    if (year !== 'all') {
        filtered = filtered.filter(t => {
            const testDate = t.date || t.exam_date || '';
            return testDate.includes(year);
        });
    }
    if (month !== 'all') {
        filtered = filtered.filter(t => {
            const testDate = t.date || t.exam_date || '';
            const testMonth = new Date(testDate).getMonth() + 1;
            return testMonth == month;
        });
    }
    if (subject !== 'all') {
        filtered = filtered.filter(t => (t.subject || t.subjects || '').includes(subject));
    }
    if (search) {
        filtered = filtered.filter(t => {
            const name = t.name || t.test_name || '';
            return name.toLowerCase().includes(search);
        });
    }
    
    displayPastTests(filtered);
}

function displayPastTests(tests) {
    const container = document.getElementById('testsContainer');
    if (!container) return;
    
    if (tests.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #94a3b8;">
                <i class="fas fa-history" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p style="font-size: 18px;">No past tests found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tests.map(test => {
        const name = test.name || test.test_name || 'Unnamed Test';
        const type = test.type || test.test_type || 'TEST';
        const date = test.date || test.exam_date || '-';
        const subject = test.subject || test.subjects || 'General';
        const participants = test.participants || test.total_participants || 0;
        const avgScore = test.avgScore || test.avg_score || 0;
        const highestScore = test.highestScore || test.highest_score || 0;
        const lowestScore = test.lowestScore || test.lowest_score || 0;
        const testId = test.id || test.test_id;
        
        return `
            <div class="card" style="padding: 24px; border-left: 4px solid ${type === 'IAT' ? '#3b82f6' : type === 'NEST' ? '#10b981' : '#f59e0b'};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${name}</h3>
                        <div style="display: flex; gap: 16px; color: #64748b; font-size: 14px;">
                            <span><i class="fas fa-calendar"></i> ${new Date(date).toLocaleDateString('en-IN')}</span>
                            <span><i class="fas fa-book"></i> ${subject}</span>
                            <span><i class="fas fa-users"></i> ${participants} students</span>
                        </div>
                    </div>
                    <span class="badge badge-${type.toLowerCase()}">${type}</span>
                    <button class="action-btn" onclick="archiveTest(${testId})" style="margin-left: 12px;">
                        <i class="fas fa-archive"></i>
                    </button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-top: 16px;">
                    <div>
                        <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Average Score</div>
                        <div style="font-size: 20px; font-weight: 600; color: #3b82f6;">${avgScore}%</div>
                    </div>
                    <div>
                        <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Highest Score</div>
                        <div style="font-size: 20px; font-weight: 600; color: #10b981;">${highestScore}%</div>
                    </div>
                    <div>
                        <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Lowest Score</div>
                        <div style="font-size: 20px; font-weight: 600; color: #f59e0b;">${lowestScore}%</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function archiveTest(id) {
    if (confirm('Archive this test?')) {
        // Call backend API to archive
        fetch(`${window.API_BASE_URL}/api/admin/past-tests/${id}/archive`, {
            method: 'POST'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                pastTests = pastTests.filter(t => (t.id || t.test_id) != id);
                updateStats();
                applyPastTestsFilters();
                if (window.AdminUtils) window.AdminUtils.showToast('Test archived successfully', 'success');
            }
        })
        .catch(err => {
            console.error('Archive error:', err);
            if (window.AdminUtils) window.AdminUtils.showToast('Failed to archive test', 'error');
        });
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