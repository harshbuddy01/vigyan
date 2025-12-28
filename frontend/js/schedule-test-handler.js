/**
 * Schedule Test Handler - Production Ready
 * Properly connects to Railway Backend API with correct data structure
 * 
 * Backend Endpoint: POST /api/admin/create-test
 * Expected Fields: testId, testName, testType, examDate, startTime, durationMinutes, description
 */

const RAILWAY_API = 'https://iin-production.up.railway.app/api';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Schedule Test Handler loaded');
    setupScheduleTestForm();
});

// Setup the Schedule Test form submission
function setupScheduleTestForm() {
    // Find the "Schedule Test" button in modal
    const scheduleButton = document.querySelector('button[onclick*="scheduleTest"]') || 
                          document.querySelector('.modal-footer .btn-primary');
    
    if (scheduleButton && scheduleButton.textContent.includes('Schedule')) {
        // Remove any existing onclick
        scheduleButton.removeAttribute('onclick');
        
        // Add new event listener
        scheduleButton.addEventListener('click', handleScheduleTest);
        console.log('✅ Schedule Test button configured');
    }
}

// Generate unique test ID
function generateTestId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `TEST-${timestamp}-${random}`;
}

// Validate form data
function validateFormData(data) {
    const errors = [];
    
    if (!data.testName || data.testName.trim() === '') {
        errors.push('Test name is required');
    }
    
    if (!data.testType || data.testType === 'Select Type') {
        errors.push('Please select exam type');
    }
    
    if (!data.examDate) {
        errors.push('Exam date is required');
    } else {
        // Check if date is in past
        const examDate = new Date(data.examDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (examDate < today) {
            errors.push('Exam date cannot be in the past');
        }
    }
    
    if (!data.startTime) {
        errors.push('Start time is required');
    }
    
    if (!data.durationMinutes || data.durationMinutes < 30) {
        errors.push('Duration must be at least 30 minutes');
    }
    
    return errors;
}

// Handle Schedule Test form submission
async function handleScheduleTest(e) {
    if (e) e.preventDefault();
    
    console.log('🔵 Scheduling test...');
    
    try {
        // Get form values with multiple fallback selectors
        const testName = getInputValue([
            'input[placeholder*="test name" i]',
            'input[placeholder*="Enter test name" i]',
            '#test-name',
            'input[type="text"]:first-of-type'
        ]);
        
        const examType = getSelectValue([
            'select#exam-type',
            'select:first-of-type',
            'select[name="type"]'
        ]);
        
        const subject = getInputValue([
            'input[placeholder*="Physics" i]',
            'input[placeholder*="Mathematics" i]',
            'input[placeholder*="subject" i]',
            '#subject'
        ]);
        
        const examDate = getInputValue([
            'input[type="date"]',
            '#test-date',
            '#exam-date'
        ]);
        
        const startTime = getInputValue([
            'input[type="time"]',
            '#test-time',
            '#start-time'
        ]);
        
        const durationMinutes = parseInt(getInputValue([
            'input[type="number"][placeholder*="180" i]',
            'input[type="number"][value="180"]',
            '#duration',
            'input[type="number"]:nth-of-type(1)'
        ])) || 180;
        
        // Prepare data matching EXACTLY what backend expects
        const testData = {
            testId: generateTestId(),
            testName: testName?.trim() || '',
            testType: examType?.toLowerCase() || 'mock',
            examDate: examDate || '',
            startTime: startTime || '',
            durationMinutes: durationMinutes,
            description: subject ? `Subject: ${subject}` : ''
        };
        
        console.log('📋 Form data collected:', testData);
        
        // Validate data
        const errors = validateFormData(testData);
        if (errors.length > 0) {
            showError(errors.join('\n'));
            return;
        }
        
        // Show loading state
        const button = e?.target;
        const originalHTML = button?.innerHTML;
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scheduling...';
        }
        
        console.log('📤 Sending to backend:', testData);
        
        // Send to Railway API - CORRECT ENDPOINT
        const response = await fetch(`${RAILWAY_API}/admin/create-test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to schedule test');
        }
        
        console.log('✅ Test scheduled successfully:', result);
        
        // Show success message
        showSuccess(`Test "${testData.testName}" scheduled successfully!`);
        
        // Close modal
        setTimeout(() => {
            closeScheduleModal();
        }, 500);
        
        // Reload tests list
        setTimeout(() => {
            if (typeof loadScheduledTests === 'function') {
                loadScheduledTests();
            } else {
                window.location.reload();
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error scheduling test:', error);
        showError(error.message || 'Failed to schedule test. Please try again.');
        
        // Reset button
        const button = e?.target;
        if (button && originalHTML) {
            button.disabled = false;
            button.innerHTML = originalHTML;
        }
    }
}

// Helper: Get input value with multiple selector fallbacks
function getInputValue(selectors) {
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.value) {
            return element.value;
        }
    }
    return null;
}

// Helper: Get select value with multiple selector fallbacks
function getSelectValue(selectors) {
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.value && element.value !== 'Select Type') {
            return element.value;
        }
    }
    return null;
}

// Close schedule modal
function closeScheduleModal() {
    // Try multiple methods to close modal
    const closeBtn = document.querySelector('.close-modal') || 
                    document.querySelector('[class*="close"]') ||
                    document.querySelector('.modal-header button');
    
    if (closeBtn) {
        closeBtn.click();
        return;
    }
    
    const modal = document.querySelector('.modal') || 
                 document.querySelector('[class*="modal"]');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
}

// Show success message
function showSuccess(message) {
    // Use AdminUtils if available
    if (window.AdminUtils && typeof window.AdminUtils.showToast === 'function') {
        window.AdminUtils.showToast(message, 'success');
        return;
    }
    
    // Fallback toast
    const toast = document.createElement('div');
    toast.className = 'custom-toast success';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        min-width: 300px;
    `;
    toast.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 20px;"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Show error message
function showError(message) {
    // Use AdminUtils if available
    if (window.AdminUtils && typeof window.AdminUtils.showToast === 'function') {
        window.AdminUtils.showToast(message, 'error');
        return;
    }
    
    // Fallback toast
    const toast = document.createElement('div');
    toast.className = 'custom-toast error';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        min-width: 300px;
        white-space: pre-line;
    `;
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle" style="font-size: 20px;"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Add animation CSS
if (!document.getElementById('schedule-handler-styles')) {
    const style = document.createElement('style');
    style.id = 'schedule-handler-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
        
        .custom-toast {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
    `;
    document.head.appendChild(style);
}

console.log('✅ Schedule Test Handler initialized - Production Ready');
