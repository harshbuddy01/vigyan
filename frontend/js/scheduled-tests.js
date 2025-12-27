/**
 * Scheduled Tests Module - CONNECTED TO BACKEND DATABASE
 */

let scheduledTests = [];

function initScheduledTests() {
    console.log('🕒 Initializing Scheduled Tests...');
    renderScheduledTestsPage();
    loadScheduledTests();
}

function renderScheduledTestsPage() {
    const container = document.getElementById('scheduled-tests-page');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div>
                <h1 style="font-size: 28px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-clock" style="color: #6366f1;"></i> Scheduled Tests
                </h1>
                <p style="color: #64748b; margin-top: 8px;">Manage upcoming test schedules</p>
            </div>
            <button class="btn-primary" onclick="openNewTestModal()">
                <i class="fas fa-plus"></i> Schedule New Test
            </button>
        </div>
        
        <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
            <select id="typeFilter" style="padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                <option value="all">All Types</option>
                <option value="IAT">IAT</option>
                <option value="NEST">NEST</option>
                <option value="ISI">ISI</option>
            </select>
            <select id="statusFilter" style="padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="today">Today</option>
            </select>
            <input type="text" id="testSearch" placeholder="Search tests..." 
                   style="flex: 1; min-width: 200px; padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
        </div>
        
        <div id="testsListContainer">
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px;"></i>
                <p style="margin-top: 12px;">Loading tests...</p>
            </div>
        </div>
    `;
    
    document.getElementById('typeFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('testSearch').addEventListener('input', applyFilters);
}

// 🔥 NEW: Load tests from backend database
async function loadScheduledTests() {
    try {
        console.log('📡 Fetching tests from backend...');
        const API_URL = window.CONFIG?.API_URL || 'https://iin-production.up.railway.app';
        
        const response = await fetch(`${API_URL}/api/admin/tests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Received tests from backend:', data);
        
        // Transform backend data to frontend format
        scheduledTests = (data.tests || []).map(test => ({
            id: test.id,
            name: test.test_name,
            type: extractTestType(test.test_id || test.test_name),
            subject: test.sections || 'ALL SUBJECT',
            date: test.exam_date,
            time: formatTime(test.exam_time),
            duration: test.duration || 180,
            totalQuestions: calculateTotalQuestions(test.sections),
            totalMarks: test.total_marks || 100,
            status: test.status || 'upcoming',
            test_id: test.test_id,
            description: test.description
        }));
        
        console.log(`📋 Loaded ${scheduledTests.length} tests`);
        displayScheduledTests(scheduledTests);
        
    } catch (error) {
        console.error('❌ Error loading tests:', error);
        scheduledTests = [];
        displayScheduledTests([]);
        if (window.AdminUtils) {
            window.AdminUtils.showToast('Failed to load tests from database', 'error');
        }
    }
}

// Helper: Extract test type from test_id or name
function extractTestType(text) {
    const upper = (text || '').toUpperCase();
    if (upper.includes('IAT')) return 'IAT';
    if (upper.includes('NEST')) return 'NEST';
    if (upper.includes('ISI')) return 'ISI';
    return 'NEST'; // default
}

// Helper: Format time from HH:MM:SS to 12-hour format
function formatTime(timeStr) {
    if (!timeStr) return '10:00 AM';
    try {
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
        return timeStr;
    }
}

// Helper: Calculate questions from sections
function calculateTotalQuestions(sections) {
    if (!sections) return 80;
    const sectionCount = sections.split(',').length;
    return sectionCount * 25; // Approximate
}

function applyFilters() {
    const type = document.getElementById('typeFilter').value;
    const status = document.getElementById('statusFilter').value;
    const search = document.getElementById('testSearch').value.toLowerCase();
    
    let filtered = scheduledTests;
    
    if (type !== 'all') {
        filtered = filtered.filter(t => t.type === type);
    }
    if (status === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(t => t.date === today);
    }
    if (search) {
        filtered = filtered.filter(t => 
            t.name.toLowerCase().includes(search) ||
            t.subject.toLowerCase().includes(search)
        );
    }
    
    displayScheduledTests(filtered);
}

function displayScheduledTests(tests) {
    const container = document.getElementById('testsListContainer');
    if (!container) return;
    
    if (tests.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 60px 20px; color: #94a3b8;">
                <i class="fas fa-clock" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p style="font-size: 18px;">No scheduled tests found</p>
                <p style="font-size: 14px; margin-top: 8px;">Click "Schedule New Test" to create one</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tests.map(test => {
        const isToday = test.date === new Date().toISOString().split('T')[0];
        return `
            <div class="card" style="margin-bottom: 16px; padding: 20px; ${isToday ? 'border-left: 4px solid #f59e0b; background: #fffbeb;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${test.name}</h3>
                            <span class="badge badge-${test.type.toLowerCase()}">${test.type}</span>
                            ${isToday ? '<span class="badge" style="background: #fed7aa; color: #92400e;">TODAY</span>' : ''}
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 16px; color: #64748b; font-size: 14px;">
                            <div>
                                <i class="fas fa-calendar"></i> <strong>${test.date}</strong>
                            </div>
                            <div>
                                <i class="fas fa-clock"></i> ${test.time} (${test.duration} min)
                            </div>
                            <div>
                                <i class="fas fa-book"></i> ${test.subject}
                            </div>
                            <div>
                                <i class="fas fa-question-circle"></i> ${test.totalQuestions} Questions
                            </div>
                            <div>
                                <i class="fas fa-trophy"></i> ${test.totalMarks} Marks
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px;">
                        <button class="action-btn" onclick="viewTestDetails(${test.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" onclick="editScheduledTest(${test.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn danger" onclick="deleteScheduledTest(${test.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openNewTestModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="width: 600px; max-width: 90vw;">
            <div class="modal-header">
                <h2>Schedule New Test</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="newTestForm" onsubmit="handleNewTest(event)" style="padding: 24px;">
                <div class="form-group">
                    <label>Test Name *</label>
                    <input type="text" name="name" required placeholder="e.g. NEST Mock Test 1">
                </div>
                <div class="form-group">
                    <label>Test ID *</label>
                    <input type="text" name="testId" required placeholder="e.g. nest-mock-1" pattern="[a-z0-9-]+" title="Only lowercase letters, numbers, and hyphens">
                </div>
                <div class="form-group">
                    <label>Exam Type *</label>
                    <select name="type" required>
                        <option value="">Select Type</option>
                        <option value="IAT">IAT</option>
                        <option value="NEST">NEST</option>
                        <option value="ISI">ISI</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Sections *</label>
                    <input type="text" name="sections" required placeholder="Physics,Chemistry,Mathematics" value="Physics,Chemistry,Mathematics">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label>Date *</label>
                        <input type="date" name="date" required>
                    </div>
                    <div class="form-group">
                        <label>Time *</label>
                        <input type="time" name="time" required value="10:00">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label>Duration (min) *</label>
                        <input type="number" name="duration" required min="30" max="300" value="180">
                    </div>
                    <div class="form-group">
                        <label>Total Marks *</label>
                        <input type="number" name="totalMarks" required min="1" value="240">
                    </div>
                </div>
                <div class="form-group">
                    <label>Description (Optional)</label>
                    <textarea name="description" rows="3" placeholder="Test description..."></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                        Cancel
                    </button>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i> Schedule Test
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

// 🔥 NEW: Save test to backend database
async function handleNewTest(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
        const API_URL = window.CONFIG?.API_URL || 'https://iin-production.up.railway.app';
        
        const testData = {
            test_name: formData.get('name'),
            test_id: formData.get('testId'),
            exam_date: formData.get('date'),
            exam_time: formData.get('time') + ':00', // Add seconds
            duration: parseInt(formData.get('duration')),
            total_marks: parseInt(formData.get('totalMarks')),
            sections: formData.get('sections'),
            description: formData.get('description') || '',
            status: 'scheduled'
        };
        
        console.log('📤 Sending test to backend:', testData);
        
        const response = await fetch(`${API_URL}/api/admin/tests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Test created successfully:', result);
        
        // Reload tests from backend
        await loadScheduledTests();
        
        // Close modal
        event.target.closest('.modal').remove();
        
        if (window.AdminUtils) {
            window.AdminUtils.showToast('Test scheduled successfully!', 'success');
        }
        
    } catch (error) {
        console.error('❌ Error creating test:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Schedule Test';
        
        if (window.AdminUtils) {
            window.AdminUtils.showToast(`Failed to create test: ${error.message}`, 'error');
        } else {
            alert(`Error: ${error.message}`);
        }
    }
}

function viewTestDetails(id) {
    const test = scheduledTests.find(t => t.id === id);
    if (!test) return;
    
    alert(`Test Details:\n\nName: ${test.name}\nType: ${test.type}\nSections: ${test.subject}\nDate: ${test.date}\nTime: ${test.time}\nDuration: ${test.duration} minutes\nTotal Marks: ${test.totalMarks}\nTest ID: ${test.test_id || 'N/A'}\nDescription: ${test.description || 'None'}`);
}

function editScheduledTest(id) {
    alert('Edit functionality coming soon!');
}

// 🔥 NEW: Delete test from backend database
async function deleteScheduledTest(id) {
    if (!confirm('Delete this scheduled test? This action cannot be undone.')) return;
    
    try {
        console.log('🗑️ Deleting test:', id);
        // TODO: Implement backend DELETE endpoint
        // For now, just show message
        alert('Delete functionality will be implemented in backend soon!');
        
    } catch (error) {
        console.error('❌ Error deleting test:', error);
        if (window.AdminUtils) {
            window.AdminUtils.showToast('Failed to delete test', 'error');
        }
    }
}

window.initScheduledTests = initScheduledTests;
window.openNewTestModal = openNewTestModal;
window.handleNewTest = handleNewTest;
window.viewTestDetails = viewTestDetails;
window.editScheduledTest = editScheduledTest;
window.deleteScheduledTest = deleteScheduledTest;
