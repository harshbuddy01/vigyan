/**
 * Create Test Page - Complete Implementation with Backend Integration
 * Last Updated: 2025-12-28 19:07 IST - FINAL FIX: snake_case to match backend
 */

// Use global API URL from config.js
const API_BASE_URL = window.API_BASE_URL || 'https://backend-vigyanpreap.vigyanprep.com';

window.initCreateTest = function () {
    console.log('🔵 Initializing Create Test page...');
    console.log('🔧 Using API Base URL:', API_BASE_URL);

    const container = document.getElementById('create-test-page');
    if (!container) {
        console.error('❌ Create test page element not found');
        return;
    }

    container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <h1><i class="fas fa-plus-circle"></i> Create New Test</h1>
            <p style="color: #64748b; margin-top: 8px;">Create and configure a new test for students</p>
        </div>
        
        <div class="form-container" style="max-width: 800px; margin: 0 auto;">
            <form id="createTestForm" style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                
                <h3 style="margin-bottom: 20px; color: #0f172a;"><i class="fas fa-info-circle"></i> Test Details</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label for="testName">Test Name *</label>
                        <input type="text" id="testName" required class="form-input" placeholder="e.g., NEST Mock Test 1">
                    </div>
                    
                    <div class="form-group">
                        <label for="examType">Exam Type *</label>
                        <select id="examType" required class="form-input">
                            <option value="">Select Exam Type</option>
                            <option value="IAT">IAT (IISER Aptitude Test)</option>
                            <option value="ISI">ISI (Indian Statistical Institute)</option>
                            <option value="NEST">NEST (National Entrance Screening Test)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="testDuration">Duration (minutes) *</label>
                        <input type="number" id="testDuration" required class="form-input" value="180" min="30" max="300">
                    </div>
                    
                    <div class="form-group">
                        <label for="totalMarks">Total Marks *</label>
                        <input type="number" id="totalMarks" required class="form-input" value="100" min="10" max="300">
                    </div>
                    
                    <div class="form-group">
                        <label for="testDate">Test Date *</label>
                        <input type="date" id="testDate" required class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label for="testTime">Test Time *</label>
                        <input type="time" id="testTime" required class="form-input" value="10:00">
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label>Select Sections to Include *</label>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 8px;">
                        <div class="section-checkbox-item" style="padding: 12px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin: 0; font-weight: 500;">
                                <input type="checkbox" name="sections" value="Physics" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <span><i class="fas fa-atom" style="color: #3b82f6;"></i> Physics</span>
                            </label>
                        </div>
                        <div class="section-checkbox-item" style="padding: 12px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin: 0; font-weight: 500;">
                                <input type="checkbox" name="sections" value="Chemistry" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <span><i class="fas fa-flask" style="color: #10b981;"></i> Chemistry</span>
                            </label>
                        </div>
                        <div class="section-checkbox-item" style="padding: 12px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin: 0; font-weight: 500;">
                                <input type="checkbox" name="sections" value="Mathematics" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <span><i class="fas fa-square-root-alt" style="color: #f59e0b;"></i> Mathematics</span>
                            </label>
                        </div>
                        <div class="section-checkbox-item" style="padding: 12px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin: 0; font-weight: 500;">
                                <input type="checkbox" name="sections" value="Biology" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <span><i class="fas fa-dna" style="color: #8b5cf6;"></i> Biology</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="testDescription">Description</label>
                    <textarea id="testDescription" class="form-input" rows="3" placeholder="Test description or instructions..."></textarea>
                </div>
                
                <div style="margin-top: 32px; display: flex; gap: 12px; justify-content: flex-end;">
                    <button type="button" onclick="resetCreateTestForm()" class="btn-secondary">
                        <i class="fas fa-redo"></i> Reset
                    </button>
                    <button type="submit" class="btn-primary" id="submitTestBtn">
                        <i class="fas fa-plus"></i> Create Test
                    </button>
                </div>
            </form>
        </div>
        
        <style>
            .section-checkbox-item:hover {
                background: #e0f2fe !important;
                border-color: #3b82f6 !important;
                transform: translateY(-2px);
            }
            .section-checkbox-item:has(input:checked) {
                background: #dbeafe !important;
                border-color: #3b82f6 !important;
            }
        </style>
    `;

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('testDate');
    if (dateInput) {
        dateInput.setAttribute('min', today);
    }

    // Add checkbox interaction handlers
    document.querySelectorAll('.section-checkbox-item').forEach(item => {
        item.addEventListener('click', function (e) {
            if (e.target.tagName !== 'INPUT') {
                const checkbox = this.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
            }
        });
    });

    // Add form submit handler
    const form = document.getElementById('createTestForm');
    if (form) {
        form.addEventListener('submit', handleCreateTest);
    }

    console.log('✅ Create Test page initialized');
};

window.resetCreateTestForm = function () {
    const form = document.getElementById('createTestForm');
    if (form) {
        form.reset();
        // Reset all checkboxes to checked
        form.querySelectorAll('input[name="sections"]').forEach(cb => cb.checked = true);
    }
};

async function handleCreateTest(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitTestBtn');
    const originalBtnText = submitBtn.innerHTML;

    // Get selected sections
    const selectedSections = Array.from(
        document.querySelectorAll('input[name="sections"]:checked')
    ).map(cb => cb.value);

    if (selectedSections.length === 0) {
        if (window.AdminUtils) {
            window.AdminUtils.showToast('Please select at least one section', 'error');
        } else {
            alert('Please select at least one section');
        }
        return;
    }

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

    // Get form values
    const testName = document.getElementById('testName').value;
    const examType = document.getElementById('examType').value.toUpperCase();
    const testDate = document.getElementById('testDate').value;
    const testTime = document.getElementById('testTime').value;
    const testDescription = document.getElementById('testDescription').value;
    const durationMinutes = parseInt(document.getElementById('testDuration').value);
    const totalMarks = parseInt(document.getElementById('totalMarks').value);
    const sectionsString = selectedSections.join(', ');

    // 🔥 CRITICAL FIX: Backend server.js expects snake_case field names
    const testData = {
        test_name: testName,                             // backend expects: test_name (snake_case)
        test_type: examType,                             // backend expects: test_type (snake_case)
        test_id: `TEST-${examType}-${Date.now()}`,       // backend expects: test_id (snake_case)
        exam_date: testDate,                             // backend expects: exam_date (snake_case)
        start_time: testTime + ':00',                    // backend expects: start_time (snake_case with seconds)
        duration_minutes: durationMinutes,               // backend expects: duration_minutes (snake_case)
        total_marks: totalMarks,                         // backend expects: total_marks (snake_case)
        subjects: sectionsString,                        // backend expects: subjects
        description: testDescription || `${examType} test: ${testName}`, // backend expects: description
        total_questions: 0,                              // backend expects: total_questions
        status: 'scheduled'                              // backend expects: status
    };

    console.log('📤 Sending test data to backend:', testData);
    console.log('🔗 API Endpoint:', `${API_BASE_URL}/api/admin/create-test`);

    try {
        // Send to backend API
        const response = await fetch(`${API_BASE_URL}/api/admin/create-test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log('📥 Backend response status:', response.status);

        const result = await response.json();
        console.log('📦 Backend response data:', result);

        if (!response.ok || !result.success) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        // Show success message
        if (window.AdminUtils) {
            window.AdminUtils.showToast(
                `✅ Test "${testName}" created successfully! Test ID: ${testData.test_id}`,
                'success'
            );
        } else {
            alert(`✅ Test "${testName}" created successfully!`);
        }

        // Reset form
        window.resetCreateTestForm();

        // Navigate to scheduled tests page after 2 seconds
        setTimeout(() => {
            const scheduledTestsLink = document.querySelector('[data-page="scheduled-tests"]');
            if (scheduledTestsLink) {
                scheduledTestsLink.click();
            }
        }, 2000);

    } catch (error) {
        console.error('❌ Error creating test:', error);
        console.error('Error details:', error.message);

        if (window.AdminUtils) {
            window.AdminUtils.showToast(
                `❌ Failed to create test: ${error.message}`,
                'error'
            );
        } else {
            alert(`❌ Failed to create test: ${error.message}`);
        }
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

console.log('✅ Create Test module loaded');
console.log('🔧 API Configuration:', API_BASE_URL);