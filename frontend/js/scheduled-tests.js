/**
 * Scheduled Tests Page - Complete Backend Integration
 * Last Updated: 2025-12-28 - Fixed API endpoints
 */

// Use global API URL
const API_BASE_URL = window.API_BASE_URL || 'https://iin-production.up.railway.app';

let allTests = [];
let filteredTests = [];

// Initialize page when called from dashboard
window.initScheduledTests = async function() {
    console.log('🔵 Initializing Scheduled Tests page...');
    console.log('🔧 Using API Base URL:', API_BASE_URL);
    
    const page = document.getElementById('scheduled-tests-page');
    if (!page) {
        console.error('❌ Scheduled tests page element not found');
        return;
    }
    
    // Render page HTML
    page.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-clock"></i> Scheduled Tests</h1>
            <button class="btn-primary" onclick="navigateToCreateTest()">
                <i class="fas fa-calendar-plus"></i> Create New Test
            </button>
        </div>

        <div class="filters-bar" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; display: flex; gap: 16px; align-items: end; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div class="filter-group" style="flex: 1;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #334155;">Type</label>
                <select id="type-filter" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <option value="all">All Types</option>
                    <option value="IAT">IAT</option>
                    <option value="NEST">NEST</option>
                    <option value="ISI">ISI</option>
                </select>
            </div>
            <div class="filter-group" style="flex: 1;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #334155;">Status</label>
                <select id="status-filter" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
            <div class="search-group" style="flex: 2; position: relative;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #334155;">Search</label>
                <div style="position: relative;">
                    <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                    <input type="text" id="search-tests" placeholder="Search tests..." style="width: 100%; padding: 10px 10px 10px 40px; border: 1px solid #e2e8f0; border-radius: 8px;">
                </div>
            </div>
        </div>

        <div id="tests-container" class="tests-grid">
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading tests...</p>
            </div>
        </div>
    `;
    
    // Load tests from backend
    await loadScheduledTests();
    setupEventListeners();
    
    console.log('✅ Scheduled Tests page initialized');
};

// Navigate to create test page
window.navigateToCreateTest = function() {
    const createTestLink = document.querySelector('[data-page="create-test"]');
    if (createTestLink) {
        createTestLink.click();
    }
};

// Setup event listeners
function setupEventListeners() {
    const typeFilter = document.getElementById('type-filter');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-tests');

    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);
}

// Load scheduled tests from database
async function loadScheduledTests() {
    try {
        showLoading(true);
        
        console.log('📡 Fetching tests from:', `${API_BASE_URL}/api/admin/scheduled-tests`);
        
        const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-tests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to load tests: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 Loaded tests data:', data);
        
        allTests = data.tests || [];
        filteredTests = [...allTests];
        
        console.log(`✅ Loaded ${allTests.length} tests`);
        
        displayTests(filteredTests);
        showLoading(false);
        
    } catch (error) {
        console.error('❌ Error loading tests:', error);
        console.error('Error details:', error.message);
        
        showError('Failed to load scheduled tests from database.');
        
        // Show empty state
        allTests = [];
        filteredTests = [];
        displayTests(filteredTests);
        showLoading(false);
    }
}

// Apply filters to tests
function applyFilters() {
    const typeFilter = document.getElementById('type-filter')?.value || 'all';
    const statusFilter = document.getElementById('status-filter')?.value || 'all';
    const searchQuery = document.getElementById('search-tests')?.value.toLowerCase() || '';

    filteredTests = allTests.filter(test => {
        const testType = test.test_type || test.testType || '';
        const testStatus = test.status || 'scheduled';
        const testName = test.test_name || test.testName || '';
        const subjects = test.subjects || '';
        
        if (typeFilter !== 'all' && testType.toLowerCase() !== typeFilter.toLowerCase()) return false;
        if (statusFilter !== 'all' && testStatus !== statusFilter) return false;
        if (searchQuery) {
            const matchName = testName.toLowerCase().includes(searchQuery);
            const matchSubjects = subjects.toLowerCase().includes(searchQuery);
            if (!matchName && !matchSubjects) return false;
        }
        return true;
    });

    console.log(`🔍 Filtered ${filteredTests.length} tests from ${allTests.length} total`);
    displayTests(filteredTests);
}

// Display tests in the UI
function displayTests(tests) {
    const container = document.getElementById('tests-container');
    if (!container) return;
    
    if (tests.length === 0) {
        container.innerHTML = `
            <div class="no-tests" style="text-align: center; padding: 80px 20px; color: #94a3b8; background: white; border-radius: 12px;">
                <i class="fas fa-calendar-times" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p style="font-size: 18px; margin-bottom: 20px; font-weight: 500;">No scheduled tests found</p>
                <p style="font-size: 14px; margin-bottom: 30px;">Create your first test to get started</p>
                <button class="btn-primary" onclick="navigateToCreateTest()">
                    <i class="fas fa-plus"></i> Create New Test
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = tests.map(test => createTestCard(test)).join('');
}

// Create test card HTML
function createTestCard(test) {
    const examDate = test.exam_date || test.examDate;
    const testDate = new Date(examDate);
    const formattedDate = testDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const startTime = test.start_time || test.startTime || 'Not set';
    const testType = (test.test_type || test.testType || 'TEST').toUpperCase();
    const testName = test.test_name || test.testName || 'Unnamed Test';
    const subjects = test.subjects || 'N/A';
    const totalQuestions = test.total_questions || 0;
    const totalMarks = test.total_marks || test.totalMarks || 0;
    const status = test.status || 'scheduled';
    const testId = test.test_id || test.testId || test.id;
    const durationMinutes = test.duration_minutes || test.durationMinutes || 180;

    // Status badge colors
    const statusColors = {
        'scheduled': { bg: '#dbeafe', color: '#1e40af' },
        'active': { bg: '#d1fae5', color: '#065f46' },
        'completed': { bg: '#e0e7ff', color: '#4338ca' },
        'cancelled': { bg: '#fee2e2', color: '#991b1b' }
    };
    
    const statusStyle = statusColors[status] || statusColors.scheduled;

    return `
        <div class="test-card" style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 16px; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" 
             onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" 
             onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)';">
            <div class="test-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                <div class="test-info">
                    <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #1e293b; font-weight: 600;">${testName}</h3>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span class="test-type" style="display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${testType}
                        </span>
                        <span class="status-badge" style="display: inline-block; padding: 4px 12px; background: ${statusStyle.bg}; color: ${statusStyle.color}; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${status.toUpperCase()}
                        </span>
                    </div>
                </div>
                <div class="test-actions" style="display: flex; gap: 8px;">
                    <button class="btn-icon" onclick="event.stopPropagation(); editTest('${testId}');" title="Edit" style="padding: 8px 12px; background: #f1f5f9; border: none; border-radius: 6px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                        <i class="fas fa-edit" style="color: #475569;"></i>
                    </button>
                    <button class="btn-icon danger" onclick="event.stopPropagation(); deleteTest('${testId}');" title="Delete" style="padding: 8px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="test-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; color: #64748b; font-size: 14px;">
                <div class="detail-item" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-calendar" style="color: #6366f1; width: 20px;"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="detail-item" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-clock" style="color: #6366f1; width: 20px;"></i>
                    <span>${startTime}</span>
                </div>
                <div class="detail-item" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-hourglass-half" style="color: #6366f1; width: 20px;"></i>
                    <span>${durationMinutes} mins</span>
                </div>
                <div class="detail-item" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-book" style="color: #6366f1; width: 20px;"></i>
                    <span>${subjects}</span>
                </div>
                <div class="detail-item" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-question-circle" style="color: #6366f1; width: 20px;"></i>
                    <span>${totalQuestions} Questions</span>
                </div>
                <div class="detail-item" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-trophy" style="color: #6366f1; width: 20px;"></i>
                    <span>${totalMarks} Marks</span>
                </div>
            </div>
        </div>
    `;
}

// Edit test
window.editTest = function(testId) {
    console.log('✏️ Edit test:', testId);
    if (window.AdminUtils) {
        window.AdminUtils.showToast('Edit functionality coming soon!', 'info');
    } else {
        alert('Edit functionality coming soon!');
    }
};

// Delete test
window.deleteTest = async function(testId) {
    if (!confirm('⚠️ Are you sure you want to delete this test? This action cannot be undone.')) return;
    
    try {
        console.log('🗑️ Deleting test:', testId);
        
        const response = await fetch(`${API_BASE_URL}/api/admin/delete-test/${testId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete test');
        }

        if (window.AdminUtils) {
            window.AdminUtils.showToast('✅ Test deleted successfully!', 'success');
        } else {
            alert('Test deleted successfully!');
        }
        
        // Reload tests
        await loadScheduledTests();
        
    } catch (error) {
        console.error('❌ Error deleting test:', error);
        if (window.AdminUtils) {
            window.AdminUtils.showToast(`❌ Failed to delete test: ${error.message}`, 'error');
        } else {
            alert(`Failed to delete test: ${error.message}`);
        }
    }
};

// Show loading state
function showLoading(show) {
    const container = document.getElementById('tests-container');
    if (!container) return;

    if (show) {
        container.innerHTML = `
            <div class="loading" style="text-align: center; padding: 80px 20px; color: #94a3b8; background: white; border-radius: 12px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 16px; color: #6366f1;"></i>
                <p style="font-size: 16px; font-weight: 500;">Loading tests...</p>
            </div>
        `;
    }
}

// Show error message
function showError(message) {
    console.error('❌', message);
    if (window.AdminUtils) {
        window.AdminUtils.showToast(message, 'error');
    }
}

console.log('✅ Scheduled Tests module loaded');
console.log('🔧 API Configuration:', API_BASE_URL);
