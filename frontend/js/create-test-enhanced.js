/**
 * Create Test Page - Enhanced Version with Comprehensive Validation
 * Last Updated: 2025-12-28 21:12 IST
 * Features: Complete validation, error handling, input sanitization, better UX
 */

// Use global API URL from config.js
const API_BASE_URL = window.API_BASE_URL ||
    (window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://backend-vigyanpreap.vigyanprep.com');

window.initCreateTest = function () {
    console.log('🔵 Initializing Create Test page (Enhanced)...');
    console.log('🔧 Using API Base URL:', API_BASE_URL);
    console.log('🌍 Environment:', window.location.hostname === 'localhost' ? 'Development' : 'Production');

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
        
        <!-- Validation Error Alert (Hidden by default) -->
        <div id="validationAlert" class="validation-alert" style="display: none; background: #fef2f2; border: 2px solid #f87171; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; align-items: start; gap: 12px;">
                <i class="fas fa-exclamation-circle" style="color: #dc2626; font-size: 20px; margin-top: 2px;"></i>
                <div style="flex: 1;">
                    <h4 style="color: #dc2626; margin: 0 0 8px 0; font-size: 16px;">Validation Errors</h4>
                    <ul id="validationErrors" style="margin: 0; padding-left: 20px; color: #991b1b;"></ul>
                </div>
                <button onclick="closeValidationAlert()" style="background: none; border: none; color: #dc2626; cursor: pointer; font-size: 20px; padding: 0;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        
        <div class="form-container" style="max-width: 800px; margin: 0 auto;">
            <form id="createTestForm" style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                
                <h3 style="margin-bottom: 20px; color: #0f172a;"><i class="fas fa-info-circle"></i> Test Details</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label for="testName">Test Name *</label>
                        <input type="text" id="testName" required class="form-input" 
                               placeholder="e.g., NEST Mock Test 1" 
                               minlength="3" maxlength="100"
                               autocomplete="off">
                        <small class="field-hint">Minimum 3 characters, maximum 100</small>
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
                        <input type="number" id="testDuration" required class="form-input" 
                               value="180" min="30" max="300" step="1">
                        <small class="field-hint">Between 30 and 300 minutes</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="totalMarks">Total Marks *</label>
                        <input type="number" id="totalMarks" required class="form-input" 
                               value="100" min="10" max="300" step="1">
                        <small class="field-hint">Between 10 and 300 marks</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="testDate">Test Date *</label>
                        <input type="date" id="testDate" required class="form-input">
                        <small class="field-hint">Cannot be in the past</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="testTime">Test Time *</label>
                        <input type="time" id="testTime" required class="form-input" value="10:00">
                        <small class="field-hint">Test start time</small>
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
                    <small class="field-hint">Select at least one section</small>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="testDescription">Description</label>
                    <textarea id="testDescription" class="form-input" rows="3" 
                              placeholder="Test description or instructions..." 
                              maxlength="500"></textarea>
                    <small class="field-hint">Optional (max 500 characters)</small>
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
            .field-hint {
                display: block;
                margin-top: 4px;
                color: #64748b;
                font-size: 12px;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .form-input:invalid {
                border-color: #ef4444;
            }
            
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

    console.log('✅ Create Test page initialized (Enhanced)');
};

// ===== UTILITY FUNCTIONS =====

/**
 * Sanitize user input to prevent XSS attacks
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    // Create a temporary div to leverage browser's built-in HTML escaping
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Show validation errors
 */
function showValidationErrors(errors) {
    const alert = document.getElementById('validationAlert');
    const errorsList = document.getElementById('validationErrors');

    if (!alert || !errorsList) return;

    errorsList.innerHTML = '';
    errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        errorsList.appendChild(li);
    });

    alert.style.display = 'block';
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Close validation alert
 */
window.closeValidationAlert = function () {
    const alert = document.getElementById('validationAlert');
    if (alert) {
        alert.style.display = 'none';
    }
};

/**
 * Comprehensive form validation
 */
function validateForm() {
    const errors = [];

    // Get form values
    const testName = document.getElementById('testName')?.value?.trim();
    const examType = document.getElementById('examType')?.value;
    const testDate = document.getElementById('testDate')?.value;
    const testTime = document.getElementById('testTime')?.value;
    const durationMinutes = parseInt(document.getElementById('testDuration')?.value);
    const totalMarks = parseInt(document.getElementById('totalMarks')?.value);
    const testDescription = document.getElementById('testDescription')?.value?.trim();
    const selectedSections = Array.from(
        document.querySelectorAll('input[name="sections"]:checked')
    ).map(cb => cb.value);

    // Validate test name
    if (!testName) {
        errors.push('Test name is required');
    } else if (testName.length < 3) {
        errors.push('Test name must be at least 3 characters long');
    } else if (testName.length > 100) {
        errors.push('Test name cannot exceed 100 characters');
    } else if (!/^[a-zA-Z0-9\s\-_()]+$/.test(testName)) {
        errors.push('Test name can only contain letters, numbers, spaces, hyphens, underscores, and parentheses');
    }

    // Validate exam type
    if (!examType) {
        errors.push('Please select an exam type');
    } else if (!['IAT', 'ISI', 'NEST'].includes(examType)) {
        errors.push('Invalid exam type selected');
    }

    // Validate test date
    if (!testDate) {
        errors.push('Test date is required');
    } else {
        const selectedDate = new Date(testDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(selectedDate.getTime())) {
            errors.push('Invalid date format');
        } else if (selectedDate < today) {
            errors.push('Test date cannot be in the past');
        } else {
            // Check if date is not too far in future (e.g., 1 year)
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            if (selectedDate > oneYearFromNow) {
                errors.push('Test date cannot be more than 1 year in the future');
            }
        }
    }

    // Validate test time
    if (!testTime) {
        errors.push('Test time is required');
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(testTime)) {
        errors.push('Invalid time format');
    }

    // Validate duration
    if (isNaN(durationMinutes)) {
        errors.push('Duration must be a valid number');
    } else if (durationMinutes < 30) {
        errors.push('Duration must be at least 30 minutes');
    } else if (durationMinutes > 300) {
        errors.push('Duration cannot exceed 300 minutes (5 hours)');
    } else if (durationMinutes % 1 !== 0) {
        errors.push('Duration must be a whole number');
    }

    // Validate total marks
    if (isNaN(totalMarks)) {
        errors.push('Total marks must be a valid number');
    } else if (totalMarks < 10) {
        errors.push('Total marks must be at least 10');
    } else if (totalMarks > 300) {
        errors.push('Total marks cannot exceed 300');
    } else if (totalMarks % 1 !== 0) {
        errors.push('Total marks must be a whole number');
    }

    // Validate sections
    if (selectedSections.length === 0) {
        errors.push('Please select at least one section');
    }

    // Validate description length (optional field)
    if (testDescription && testDescription.length > 500) {
        errors.push('Description cannot exceed 500 characters');
    }

    return errors;
}

/**
 * Reset form to default values
 */
window.resetCreateTestForm = function () {
    const form = document.getElementById('createTestForm');
    if (form) {
        form.reset();
        // Reset all checkboxes to checked
        form.querySelectorAll('input[name="sections"]').forEach(cb => cb.checked = true);
        // Clear validation errors
        window.closeValidationAlert();
    }
};

/**
 * Handle form submission
 */
async function handleCreateTest(e) {
    e.preventDefault();

    // Close any existing validation alerts
    window.closeValidationAlert();

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
        showValidationErrors(validationErrors);
        console.warn('❌ Validation failed:', validationErrors);
        return;
    }

    const submitBtn = document.getElementById('submitTestBtn');
    const originalBtnText = submitBtn.innerHTML;

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

    try {
        // Get and sanitize form values
        const testName = sanitizeInput(document.getElementById('testName').value.trim());
        const examType = document.getElementById('examType').value.toUpperCase();
        const testDate = document.getElementById('testDate').value;
        const testTime = document.getElementById('testTime').value;
        const testDescription = sanitizeInput(document.getElementById('testDescription').value.trim());
        const durationMinutes = parseInt(document.getElementById('testDuration').value);
        const totalMarks = parseInt(document.getElementById('totalMarks').value);

        const selectedSections = Array.from(
            document.querySelectorAll('input[name="sections"]:checked')
        ).map(cb => sanitizeInput(cb.value));

        const sectionsString = selectedSections.join(', ');

        // Generate unique test ID
        const timestamp = Date.now();
        const testId = `TEST-${examType}-${timestamp}`;

        // Prepare data matching backend expectations (snake_case)
        const testData = {
            test_name: testName,
            test_type: examType,
            test_id: testId,
            exam_date: testDate,
            start_time: testTime + ':00',
            duration_minutes: durationMinutes,
            total_marks: totalMarks,
            subjects: sectionsString,
            description: testDescription || `${examType} test: ${testName}`,
            total_questions: 0,
            status: 'scheduled'
        };

        console.log('📤 Sending test data to backend:', testData);
        console.log('🔗 API Endpoint:', `${API_BASE_URL}/api/admin/create-test`);

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
                `✅ Test "${testName}" created successfully!\nTest ID: ${testId}`,
                'success'
            );
        } else {
            alert(`✅ Test "${testName}" created successfully!\nTest ID: ${testId}`);
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

console.log('✅ Create Test module loaded (Enhanced Version)');
console.log('🔧 API Configuration:', API_BASE_URL);
console.log('🛡️ Features: Comprehensive validation, input sanitization, error handling');