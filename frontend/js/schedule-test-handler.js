/**
 * Schedule Test Handler - Connects Schedule Test form to Railway Backend API
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
    const scheduleButton = document.querySelector('[onclick*="Schedule Test"]') || 
                          document.querySelector('.btn-primary[type="button"]');
    
    if (scheduleButton) {
        // Remove any existing onclick
        scheduleButton.removeAttribute('onclick');
        
        // Add new event listener
        scheduleButton.addEventListener('click', handleScheduleTest);
        console.log('✅ Schedule Test button configured');
    }
    
    // Also listen for form submission if form exists
    const scheduleForm = document.querySelector('#schedule-test-form') || 
                        document.querySelector('form');
    
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleScheduleTest();
        });
    }
}

// Handle Schedule Test form submission
async function handleScheduleTest(e) {
    if (e) e.preventDefault();
    
    console.log('🔵 Scheduling test...');
    
    try {
        // Get form values
        const testName = document.querySelector('input[placeholder*="test name"]')?.value || 
                        document.querySelector('#test-name')?.value;
        const examType = document.querySelector('select')?.value || 
                        document.querySelector('#exam-type')?.value;
        const subject = document.querySelector('input[placeholder*="Physics"]')?.value || 
                       document.querySelector('#subject')?.value;
        const date = document.querySelector('input[type="date"]')?.value || 
                    document.querySelector('#test-date')?.value;
        const time = document.querySelector('input[type="time"]')?.value || 
                    document.querySelector('#test-time')?.value;
        const duration = document.querySelector('input[type="number"][value="180"]')?.value || 
                        document.querySelector('#duration')?.value;
        const questions = document.querySelectorAll('input[type="number"]')[1]?.value || 
                         document.querySelector('#questions')?.value;
        const totalMarks = document.querySelectorAll('input[type="number"]')[2]?.value || 
                          document.querySelector('#total-marks')?.value;
        
        // Validate required fields
        if (!testName || !examType || !subject || !date || !time) {
            showError('Please fill in all required fields!');
            return;
        }
        
        // Show loading state
        const button = e?.target;
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scheduling...';
        }
        
        // Prepare data for API
        const testData = {
            name: testName,
            type: examType.toLowerCase(),
            subjects: subject,
            date: date,
            time: time,
            duration: parseInt(duration) || 180,
            total_questions: parseInt(questions) || 50,
            total_marks: parseInt(totalMarks) || 100,
            status: 'scheduled'
        };
        
        console.log('📤 Sending test data:', testData);
        
        // Send to Railway API
        const response = await fetch(`${RAILWAY_API}/admin/tests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAdminToken()}` // Add auth if needed
            },
            body: JSON.stringify(testData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to schedule test');
        }
        
        const result = await response.json();
        console.log('✅ Test scheduled successfully:', result);
        
        // Show success message
        showSuccess('Test scheduled successfully!');
        
        // Close modal
        closeScheduleModal();
        
        // Reload tests list
        if (typeof loadScheduledTests === 'function') {
            setTimeout(loadScheduledTests, 500);
        } else {
            setTimeout(() => window.location.reload(), 1000);
        }
        
    } catch (error) {
        console.error('❌ Error scheduling test:', error);
        showError(error.message || 'Failed to schedule test. Please try again.');
        
        // Reset button
        const button = e?.target;
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-calendar-plus"></i> Schedule Test';
        }
    }
}

// Close schedule modal
function closeScheduleModal() {
    const modal = document.querySelector('.modal') || 
                 document.querySelector('[class*="modal"]');
    const closeBtn = document.querySelector('.close-modal') || 
                    document.querySelector('[onclick*="close"]');
    
    if (closeBtn) {
        closeBtn.click();
    } else if (modal) {
        modal.remove();
    }
}

// Get admin token from session/localStorage
function getAdminToken() {
    return sessionStorage.getItem('adminToken') || 
           localStorage.getItem('adminToken') || 
           '';
}

// Show success message
function showSuccess(message) {
    // Use AdminUtils if available
    if (window.AdminUtils && window.AdminUtils.showToast) {
        window.AdminUtils.showToast(message, 'success');
        return;
    }
    
    // Fallback toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 20px;"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// Show error message
function showError(message) {
    // Use AdminUtils if available
    if (window.AdminUtils && window.AdminUtils.showToast) {
        window.AdminUtils.showToast(message, 'error');
        return;
    }
    
    // Fallback toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle" style="font-size: 20px;"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// Add animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Schedule Test Handler initialized');
