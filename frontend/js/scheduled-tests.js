// Scheduled Tests Module
(function() {
    'use strict';

    window.initScheduledTests = function() {
        console.log('⏰ Initializing Scheduled Tests...');
        
        const scheduledTestsHTML = `
            <div class="page-header">
                <h1><i class="fas fa-clock"></i> Scheduled Tests</h1>
                <button class="btn-primary" onclick="showScheduleTestModal()">
                    <i class="fas fa-plus"></i> Schedule New Test
                </button>
            </div>

            <div class="filter-bar" style="background: white; padding: 16px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
                <select id="filterExamType" onchange="filterScheduledTests()" style="padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
                    <option value="all">All Exam Types</option>
                    <option value="JAM">IIT JAM</option>
                    <option value="GATE">GATE</option>
                    <option value="Practice">Practice</option>
                </select>
                <select id="filterStatus" onchange="filterScheduledTests()" style="padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
                    <option value="all">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="today">Today</option>
                </select>
                <input type="text" id="searchTests" onkeyup="filterScheduledTests()" placeholder="Search tests..." style="padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; flex: 1; min-width: 200px;">
            </div>

            <div id="scheduledTestsContainer"></div>

            <!-- Schedule Test Modal -->
            <div id="scheduleTestModal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2>Schedule New Test</h2>
                        <button onclick="closeScheduleTestModal()" class="close-btn">&times;</button>
                    </div>
                    <form id="scheduleTestForm" onsubmit="handleScheduleTest(event)">
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Test Name *</label>
                                <input type="text" id="testName" required placeholder="e.g., JAM Physics Mock 1">
                            </div>
                            <div class="form-group">
                                <label>Exam Type *</label>
                                <select id="examType" required>
                                    <option value="JAM">IIT JAM</option>
                                    <option value="GATE">GATE</option>
                                    <option value="Practice">Practice Test</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Subject *</label>
                                <select id="subject" required>
                                    <option value="Physics">Physics</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Chemistry">Chemistry</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Total Marks *</label>
                                <input type="number" id="totalMarks" required value="100" min="10" max="300">
                            </div>
                        </div>
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Date *</label>
                                <input type="date" id="testDate" required>
                            </div>
                            <div class="form-group">
                                <label>Start Time *</label>
                                <input type="time" id="startTime" required>
                            </div>
                            <div class="form-group">
                                <label>Duration (min) *</label>
                                <input type="number" id="duration" required value="180" min="30" max="300">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="testDescription" rows="3" placeholder="Test details and instructions..."></textarea>
                        </div>
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="sendNotification">
                                <span>Send notification to all students</span>
                            </label>
                        </div>
                        <div class="modal-actions">
                            <button type="button" onclick="closeScheduleTestModal()" class="btn-secondary">Cancel</button>
                            <button type="submit" class="btn-primary">Schedule Test</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Test Details Modal -->
            <div id="testDetailsModal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2>Test Details</h2>
                        <button onclick="closeTestDetailsModal()" class="close-btn">&times;</button>
                    </div>
                    <div id="testDetailsContent" style="padding: 20px;"></div>
                    <div class="modal-actions">
                        <button onclick="editTest()" class="btn-secondary"><i class="fas fa-edit"></i> Edit</button>
                        <button onclick="deleteScheduledTest()" class="btn-danger"><i class="fas fa-trash"></i> Delete</button>
                        <button onclick="closeTestDetailsModal()" class="btn-primary">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('scheduled-tests-page').innerHTML = scheduledTestsHTML;
        loadScheduledTests();
    };

    let scheduledTests = [];
    let currentTestId = null;

    function loadScheduledTests() {
        const stored = localStorage.getItem('scheduledTests');
        scheduledTests = stored ? JSON.parse(stored) : [];
        renderScheduledTests();
    }

    function saveScheduledTests() {
        localStorage.setItem('scheduledTests', JSON.stringify(scheduledTests));
    }

    function renderScheduledTests() {
        const container = document.getElementById('scheduledTestsContainer');
        if (!container) return;

        if (scheduledTests.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 12px;">
                    <i class="fas fa-calendar-times" style="font-size: 64px; color: #cbd5e1; margin-bottom: 16px;"></i>
                    <h3 style="color: #64748b; margin-bottom: 8px;">No Scheduled Tests</h3>
                    <p style="color: #94a3b8;">Schedule your first test to get started</p>
                </div>
            `;
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortedTests = scheduledTests.sort((a, b) => {
            return new Date(a.date + ' ' + a.startTime) - new Date(b.date + ' ' + b.startTime);
        });

        const html = sortedTests.map(test => {
            const testDate = new Date(test.date);
            testDate.setHours(0, 0, 0, 0);
            const isToday = testDate.getTime() === today.getTime();
            const isPast = testDate < today;
            
            const colors = {
                'JAM': { bg: '#dbeafe', text: '#1e40af' },
                'GATE': { bg: '#d1fae5', text: '#065f46' },
                'Practice': { bg: '#fed7aa', text: '#92400e' }
            };
            const color = colors[test.examType] || colors.Practice;

            return `
                <div class="test-card" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 16px; border-left: 4px solid ${color.text}; cursor: pointer; transition: all 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" 
                     onclick="viewTestDetails(${test.id})">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${test.name}</h3>
                                <span style="background: ${color.bg}; color: ${color.text}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                    ${test.examType}
                                </span>
                                ${isToday ? '<span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;"><i class="fas fa-clock"></i> TODAY</span>' : ''}
                            </div>
                            <div style="display: flex; gap: 24px; color: #64748b; font-size: 14px; margin-top: 12px;">
                                <div><i class="fas fa-calendar"></i> ${new Date(test.date).toLocaleDateString('en-IN')}</div>
                                <div><i class="fas fa-clock"></i> ${test.startTime}</div>
                                <div><i class="fas fa-hourglass-half"></i> ${test.duration} min</div>
                                <div><i class="fas fa-book"></i> ${test.subject}</div>
                                <div><i class="fas fa-star"></i> ${test.totalMarks} marks</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="event.stopPropagation(); editTestQuick(${test.id})" class="action-btn" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="event.stopPropagation(); deleteTestQuick(${test.id})" class="action-btn danger" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    window.filterScheduledTests = function() {
        const examType = document.getElementById('filterExamType')?.value || 'all';
        const status = document.getElementById('filterStatus')?.value || 'all';
        const search = document.getElementById('searchTests')?.value.toLowerCase() || '';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filtered = scheduledTests.filter(test => {
            const matchesExamType = examType === 'all' || test.examType === examType;
            const matchesSearch = test.name.toLowerCase().includes(search) || 
                                 test.subject.toLowerCase().includes(search);
            
            const testDate = new Date(test.date);
            testDate.setHours(0, 0, 0, 0);
            const isToday = testDate.getTime() === today.getTime();
            const isUpcoming = testDate > today;
            
            let matchesStatus = true;
            if (status === 'today') matchesStatus = isToday;
            if (status === 'upcoming') matchesStatus = isUpcoming;
            
            return matchesExamType && matchesSearch && matchesStatus;
        });

        scheduledTests = filtered;
        renderScheduledTests();
        loadScheduledTests(); // Reload original data
    };

    window.showScheduleTestModal = function() {
        document.getElementById('scheduleTestModal').style.display = 'flex';
        // Set minimum date to today
        document.getElementById('testDate').min = new Date().toISOString().split('T')[0];
    };

    window.closeScheduleTestModal = function() {
        document.getElementById('scheduleTestModal').style.display = 'none';
        document.getElementById('scheduleTestForm').reset();
    };

    window.handleScheduleTest = function(e) {
        e.preventDefault();
        
        const newTest = {
            id: Date.now(),
            name: document.getElementById('testName').value,
            examType: document.getElementById('examType').value,
            subject: document.getElementById('subject').value,
            totalMarks: parseInt(document.getElementById('totalMarks').value),
            date: document.getElementById('testDate').value,
            startTime: document.getElementById('startTime').value,
            duration: parseInt(document.getElementById('duration').value),
            description: document.getElementById('testDescription').value,
            sendNotification: document.getElementById('sendNotification').checked,
            createdAt: new Date().toISOString()
        };
        
        scheduledTests.push(newTest);
        saveScheduledTests();
        renderScheduledTests();
        closeScheduleTestModal();
        
        if (window.AdminUtils) {
            window.AdminUtils.showToast('Test scheduled successfully!', 'success');
        } else {
            alert('Test scheduled successfully!');
        }
    };

    window.viewTestDetails = function(testId) {
        currentTestId = testId;
        const test = scheduledTests.find(t => t.id === testId);
        if (!test) return;
        
        const content = `
            <div style="line-height: 2;">
                <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                    <span style="background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 8px; font-weight: 600;">${test.examType}</span>
                    <span style="background: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 8px;">${test.subject}</span>
                </div>
                <h3 style="margin-bottom: 16px;">${test.name}</h3>
                <p><strong><i class="fas fa-calendar"></i> Date:</strong> ${new Date(test.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong><i class="fas fa-clock"></i> Time:</strong> ${test.startTime}</p>
                <p><strong><i class="fas fa-hourglass-half"></i> Duration:</strong> ${test.duration} minutes</p>
                <p><strong><i class="fas fa-star"></i> Total Marks:</strong> ${test.totalMarks}</p>
                ${test.description ? `<p><strong><i class="fas fa-info-circle"></i> Description:</strong><br>${test.description}</p>` : ''}
            </div>
        `;
        
        document.getElementById('testDetailsContent').innerHTML = content;
        document.getElementById('testDetailsModal').style.display = 'flex';
    };

    window.closeTestDetailsModal = function() {
        document.getElementById('testDetailsModal').style.display = 'none';
        currentTestId = null;
    };

    window.deleteScheduledTest = function() {
        if (!currentTestId) return;
        if (!confirm('Are you sure you want to delete this scheduled test?')) return;
        
        scheduledTests = scheduledTests.filter(t => t.id !== currentTestId);
        saveScheduledTests();
        renderScheduledTests();
        closeTestDetailsModal();
        
        if (window.AdminUtils) {
            window.AdminUtils.showToast('Test deleted successfully!', 'success');
        } else {
            alert('Test deleted successfully!');
        }
    };

    window.deleteTestQuick = function(testId) {
        if (!confirm('Delete this test?')) return;
        
        scheduledTests = scheduledTests.filter(t => t.id !== testId);
        saveScheduledTests();
        renderScheduledTests();
        
        if (window.AdminUtils) {
            window.AdminUtils.showToast('Test deleted!', 'success');
        }
    };

    window.editTestQuick = function(testId) {
        alert('Edit functionality - Coming soon! Use view details for now.');
    };

    window.editTest = function() {
        alert('Edit functionality - Coming soon!');
    };

})();
