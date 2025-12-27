// Test Calendar Module
(function() {
    'use strict';

    let calendar = null;
    let events = [];

    window.initTestCalendar = function() {
        console.log('📅 Initializing Test Calendar...');
        
        const calendarHTML = `
            <div class="page-header">
                <h1><i class="fas fa-calendar-alt"></i> Test Calendar</h1>
                <button class="btn-primary" onclick="showAddEventModal()">
                    <i class="fas fa-plus"></i> Schedule Test
                </button>
            </div>

            <div class="calendar-container" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <button onclick="previousMonth()" class="btn-secondary">
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    <h2 id="currentMonth" style="margin: 0; font-size: 24px; font-weight: 600;"></h2>
                    <button onclick="nextMonth()" class="btn-secondary">
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div id="calendarGrid" class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px;"></div>
                
                <div class="calendar-legend" style="display: flex; gap: 20px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 16px; height: 16px; background: #3b82f6; border-radius: 4px;"></div>
                        <span>JAM</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 16px; height: 16px; background: #10b981; border-radius: 4px;"></div>
                        <span>GATE</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 16px; height: 16px; background: #f59e0b; border-radius: 4px;"></div>
                        <span>Practice</span>
                    </div>
                </div>
            </div>

            <!-- Add Event Modal -->
            <div id="addEventModal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>Schedule Test</h2>
                        <button onclick="closeAddEventModal()" class="close-btn">&times;</button>
                    </div>
                    <form id="addEventForm" onsubmit="handleAddEvent(event)">
                        <div class="form-group">
                            <label>Test Name *</label>
                            <input type="text" id="eventTitle" required placeholder="e.g., JAM Physics Mock Test">
                        </div>
                        <div class="form-group">
                            <label>Test Type *</label>
                            <select id="eventType" required>
                                <option value="JAM">IIT JAM</option>
                                <option value="GATE">GATE</option>
                                <option value="Practice">Practice Test</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Date *</label>
                            <input type="date" id="eventDate" required>
                        </div>
                        <div class="form-group">
                            <label>Start Time *</label>
                            <input type="time" id="eventStartTime" required>
                        </div>
                        <div class="form-group">
                            <label>Duration (minutes) *</label>
                            <input type="number" id="eventDuration" required value="180" min="30" max="300">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="eventDescription" rows="3" placeholder="Test details..."></textarea>
                        </div>
                        <div class="modal-actions">
                            <button type="button" onclick="closeAddEventModal()" class="btn-secondary">Cancel</button>
                            <button type="submit" class="btn-primary">Schedule Test</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- View Event Modal -->
            <div id="viewEventModal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>Test Details</h2>
                        <button onclick="closeViewEventModal()" class="close-btn">&times;</button>
                    </div>
                    <div id="eventDetails" style="padding: 20px;"></div>
                    <div class="modal-actions">
                        <button onclick="deleteEvent()" class="btn-danger">Delete</button>
                        <button onclick="closeViewEventModal()" class="btn-secondary">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('test-calendar-page').innerHTML = calendarHTML;
        loadEvents();
        renderCalendar();
    };

    let currentDate = new Date();
    let selectedEventId = null;

    window.previousMonth = function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    };

    window.nextMonth = function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    };

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '';
        
        // Add day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const header = document.createElement('div');
            header.style.cssText = 'font-weight: 600; text-align: center; padding: 10px; color: #64748b;';
            header.textContent = day;
            grid.appendChild(header);
        });
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.style.cssText = 'background: #f8fafc; border-radius: 8px;';
            grid.appendChild(empty);
        }
        
        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            const cellDate = new Date(year, month, day);
            const dateStr = cellDate.toISOString().split('T')[0];
            
            const dayEvents = events.filter(e => e.date === dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            cell.style.cssText = `
                min-height: 100px;
                padding: 8px;
                background: ${isToday ? '#eff6ff' : 'white'};
                border: ${isToday ? '2px solid #3b82f6' : '1px solid #e2e8f0'};
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            `;
            
            cell.innerHTML = `
                <div style="font-weight: ${isToday ? '700' : '500'}; margin-bottom: 4px; color: ${isToday ? '#3b82f6' : '#1e293b'};">
                    ${day}
                </div>
            `;
            
            dayEvents.forEach(event => {
                const badge = document.createElement('div');
                const colors = {
                    'JAM': '#3b82f6',
                    'GATE': '#10b981',
                    'Practice': '#f59e0b',
                    'Other': '#8b5cf6'
                };
                badge.style.cssText = `
                    background: ${colors[event.type] || colors.Other};
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    margin-top: 2px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                `;
                badge.textContent = event.title;
                badge.onclick = (e) => {
                    e.stopPropagation();
                    viewEvent(event.id);
                };
                cell.appendChild(badge);
            });
            
            grid.appendChild(cell);
        }
    }

    function loadEvents() {
        const stored = localStorage.getItem('testCalendarEvents');
        events = stored ? JSON.parse(stored) : [];
    }

    function saveEvents() {
        localStorage.setItem('testCalendarEvents', JSON.stringify(events));
    }

    window.showAddEventModal = function() {
        document.getElementById('addEventModal').style.display = 'flex';
    };

    window.closeAddEventModal = function() {
        document.getElementById('addEventModal').style.display = 'none';
        document.getElementById('addEventForm').reset();
    };

    window.handleAddEvent = function(e) {
        e.preventDefault();
        
        const newEvent = {
            id: Date.now(),
            title: document.getElementById('eventTitle').value,
            type: document.getElementById('eventType').value,
            date: document.getElementById('eventDate').value,
            startTime: document.getElementById('eventStartTime').value,
            duration: document.getElementById('eventDuration').value,
            description: document.getElementById('eventDescription').value
        };
        
        events.push(newEvent);
        saveEvents();
        renderCalendar();
        closeAddEventModal();
        
        if (window.AdminUtils) {
            window.AdminUtils.showToast('Test scheduled successfully!', 'success');
        } else {
            alert('Test scheduled successfully!');
        }
    };

    window.viewEvent = function(eventId) {
        selectedEventId = eventId;
        const event = events.find(e => e.id === eventId);
        if (!event) return;
        
        const details = `
            <div style="line-height: 1.8;">
                <p><strong>Test:</strong> ${event.title}</p>
                <p><strong>Type:</strong> ${event.type}</p>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${event.startTime}</p>
                <p><strong>Duration:</strong> ${event.duration} minutes</p>
                ${event.description ? `<p><strong>Description:</strong><br>${event.description}</p>` : ''}
            </div>
        `;
        
        document.getElementById('eventDetails').innerHTML = details;
        document.getElementById('viewEventModal').style.display = 'flex';
    };

    window.closeViewEventModal = function() {
        document.getElementById('viewEventModal').style.display = 'none';
        selectedEventId = null;
    };

    window.deleteEvent = function() {
        if (!selectedEventId) return;
        if (!confirm('Delete this scheduled test?')) return;
        
        events = events.filter(e => e.id !== selectedEventId);
        saveEvents();
        renderCalendar();
        closeViewEventModal();
        
        if (window.AdminUtils) {
            window.AdminUtils.showToast('Test deleted successfully!', 'success');
        } else {
            alert('Test deleted successfully!');
        }
    };

})();
