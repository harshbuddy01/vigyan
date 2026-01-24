/**
 * Test Calendar Module - Saves tests to DATABASE
 */

let currentDate = new Date();
let calendarEvents = [];

function initTestCalendar() {
    console.log('📅 Initializing Test Calendar...');
    renderCalendarPage();
    loadCalendarEvents();
}

function renderCalendarPage() {
    const container = document.getElementById('test-calendar-page');
    if (!container) return;

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div>
                <h1 style="font-size: 28px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-calendar-alt" style="color: #6366f1;"></i> Test Calendar
                </h1>
                <p style="color: #64748b; margin-top: 8px;">Schedule and manage test dates - Students see only their purchased series</p>
            </div>
            <button class="btn-primary" onclick="openScheduleModal()">
                <i class="fas fa-plus"></i> Schedule Test
            </button>
        </div>
        
        <div class="card" style="padding: 0; overflow: hidden;">
            <div style="background: #f8fafc; padding: 16px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <button class="btn-secondary" onclick="changeMonth(-1)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h2 id="calendarMonth" style="margin: 0; font-size: 20px; font-weight: 600;"></h2>
                <button class="btn-secondary" onclick="changeMonth(1)">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            
            <div id="calendarGrid" style="padding: 20px;"></div>
        </div>
        
        <div style="margin-top: 24px;">
            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">All Scheduled Tests</h3>
            <div id="scheduledTestsList"></div>
        </div>
        
        <div style="margin-top: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 16px; height: 16px; background: #dbeafe; border-radius: 4px;"></div>
                <span style="color: #64748b; font-size: 14px;">IAT Test</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 16px; height: 16px; background: #d1fae5; border-radius: 4px;"></div>
                <span style="color: #64748b; font-size: 14px;">NEST Test</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 16px; height: 16px; background: #fed7aa; border-radius: 4px;"></div>
                <span style="color: #64748b; font-size: 14px;">ISI Test</span>
            </div>
        </div>
    `;
}

async function loadCalendarEvents() {
    try {
        console.log('🔄 Loading tests from database...');
        const response = await fetch('https://backend-vigyanpreap.vigyanprep.com/api/admin/tests');
        const data = await response.json();

        calendarEvents = (data.tests || []).map(test => ({
            id: test.id,
            name: test.test_name,
            type: (test.test_id || '').toUpperCase(),
            date: test.exam_date,
            duration: test.duration || test.test_duration || 180,
            totalQuestions: test.total_questions || 0
        }));

        console.log(`✅ Loaded ${calendarEvents.length} tests from database`);
        renderCalendar();
        renderTestsList();
    } catch (error) {
        console.error('❌ Error loading tests:', error);
        if (window.AdminUtils) window.AdminUtils.showToast('Failed to load tests', 'error');
    }
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('calendarMonth').textContent =
        currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">';

    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        html += `<div style="text-align: center; font-weight: 600; color: #64748b; padding: 8px; font-size: 13px;">${day}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
        html += '<div></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = calendarEvents.filter(e => e.date === dateStr);
        const isToday = dateStr === new Date().toISOString().split('T')[0];

        html += `
            <div style="
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 8px;
                min-height: 80px;
                background: white;
                ${isToday ? 'border: 2px solid #6366f1; background: #f0f1ff;' : ''}
                cursor: pointer;
            " onclick="viewDayEvents('${dateStr}')">
                <div style="font-weight: ${isToday ? '700' : '600'}; color: ${isToday ? '#6366f1' : '#1e293b'}; margin-bottom: 4px;">${day}</div>
                ${dayEvents.map(e => `
                    <div style="
                        font-size: 11px;
                        padding: 4px 6px;
                        background: ${e.type === 'IAT' ? '#dbeafe' : e.type === 'NEST' ? '#d1fae5' : '#fed7aa'};
                        color: ${e.type === 'IAT' ? '#1e40af' : e.type === 'NEST' ? '#065f46' : '#92400e'};
                        border-radius: 4px;
                        margin-bottom: 2px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    ">${e.name}</div>
                `).join('')}
            </div>
        `;
    }

    html += '</div>';
    document.getElementById('calendarGrid').innerHTML = html;
}

function renderTestsList() {
    const container = document.getElementById('scheduledTestsList');
    if (!container) return;

    if (calendarEvents.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 40px;">No tests scheduled yet. Click "Schedule Test" to add one.</p>';
        return;
    }

    // Sort by date
    const sorted = [...calendarEvents].sort((a, b) => new Date(a.date) - new Date(b.date));

    let html = '<div style="display: grid; gap: 12px;">';

    sorted.forEach(test => {
        const testDate = new Date(test.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        testDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil((testDate - today) / (1000 * 60 * 60 * 24));

        let statusBadge = '';
        if (daysUntil < 0) {
            statusBadge = '<span style="background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">Completed</span>';
        } else if (daysUntil === 0) {
            statusBadge = '<span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">TODAY</span>';
        } else if (daysUntil <= 7) {
            statusBadge = `<span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">In ${daysUntil} days</span>`;
        } else {
            statusBadge = `<span style="background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">In ${daysUntil} days</span>`;
        }

        html += `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <span class="badge badge-${test.type.toLowerCase()}">${test.type}</span>
                        <h4 style="margin: 0; font-size: 16px; font-weight: 600;">${test.name}</h4>
                    </div>
                    <div style="display: flex; gap: 16px; color: #64748b; font-size: 14px;">
                        <span><i class="fas fa-calendar"></i> ${new Date(test.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span><i class="fas fa-clock"></i> ${test.duration} min</span>
                        <span><i class="fas fa-question-circle"></i> ${test.totalQuestions} questions</span>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    ${statusBadge}
                    <button class="action-btn danger" onclick="deleteTest(${test.id})" title="Delete Test">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

function openScheduleModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="width: 500px;">
            <div class="modal-header">
                <h2>Schedule New Test</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="scheduleForm" onsubmit="handleScheduleTest(event)" style="padding: 24px;">
                <div class="form-group">
                    <label>Test Name *</label>
                    <input type="text" name="name" required placeholder="e.g., IAT Mock Test 1">
                </div>
                <div class="form-group">
                    <label>Exam Series *</label>
                    <select name="type" required>
                        <option value="">Select Series</option>
                        <option value="iat">IAT (Indian Institute of Science)</option>
                        <option value="nest">NEST (National Entrance Screening Test)</option>
                        <option value="isi">ISI (Indian Statistical Institute)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Test Date *</label>
                    <input type="date" name="date" required>
                </div>
                <div class="form-group">
                    <label>Duration (minutes) *</label>
                    <input type="number" name="duration" value="180" min="30" max="300" required>
                </div>
                <div class="form-group">
                    <label>Total Questions *</label>
                    <input type="number" name="totalQuestions" value="60" min="1" max="200" required>
                </div>
                <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #92400e;">
                        <strong>⚠️ Note:</strong> Students who purchased this test series will see this test in their calendar.
                    </p>
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

async function handleScheduleTest(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const testData = {
        test_name: formData.get('name'),
        test_id: formData.get('type'),
        exam_date: formData.get('date'),
        duration: parseInt(formData.get('duration')),
        total_questions: parseInt(formData.get('totalQuestions')),
        status: 'scheduled'
    };

    try {
        console.log('📤 Saving test to database...', testData);

        const response = await fetch('https://backend-vigyanpreap.vigyanprep.com/api/admin/tests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        if (!response.ok) throw new Error('Failed to save test');

        console.log('✅ Test saved successfully!');
        if (window.AdminUtils) window.AdminUtils.showToast('Test scheduled successfully! Students can now see it in their calendar.', 'success');

        event.target.closest('.modal').remove();
        await loadCalendarEvents();

    } catch (error) {
        console.error('❌ Error saving test:', error);
        if (window.AdminUtils) window.AdminUtils.showToast('Failed to schedule test. Please try again.', 'error');
    }
}

async function deleteTest(testId) {
    if (!confirm('Are you sure you want to delete this test? Students will no longer see it.')) return;

    try {
        console.log(`🗑️ Deleting test #${testId}...`);

        const response = await fetch(`https://backend-vigyanpreap.vigyanprep.com/api/admin/tests/${testId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete test');

        console.log('✅ Test deleted successfully!');
        if (window.AdminUtils) window.AdminUtils.showToast('Test deleted successfully', 'success');

        await loadCalendarEvents();

    } catch (error) {
        console.error('❌ Error deleting test:', error);
        if (window.AdminUtils) window.AdminUtils.showToast('Failed to delete test', 'error');
    }
}

function viewDayEvents(dateStr) {
    const dayEvents = calendarEvents.filter(e => e.date === dateStr);

    if (dayEvents.length === 0) {
        alert('No tests scheduled for this day.');
        return;
    }

    const eventsList = dayEvents.map(e =>
        `${e.name} (${e.type}) - ${e.duration} minutes - ${e.totalQuestions} questions`
    ).join('\n');

    alert(`Tests on ${dateStr}:\n\n${eventsList}`);
}

window.initTestCalendar = initTestCalendar;
window.changeMonth = changeMonth;
window.openScheduleModal = openScheduleModal;
window.handleScheduleTest = handleScheduleTest;
window.viewDayEvents = viewDayEvents;
window.deleteTest = deleteTest;