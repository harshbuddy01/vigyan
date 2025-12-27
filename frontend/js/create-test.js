/**
 * Create Test Page - Complete Implementation with Exam Types and Sections
 */

function initCreateTest() {
    console.log('Initializing Create Test page...');
    
    const container = document.getElementById('create-test-page');
    if (!container) return;
    
    container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <h2>Create New Test</h2>
            <p>Create and schedule a new test</p>
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
                    <button type="submit" class="btn-primary">
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
    document.getElementById('testDate').setAttribute('min', today);
    
    // Add checkbox interaction handlers
    document.querySelectorAll('.section-checkbox-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') {
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
            }
        });
    });
    
    document.getElementById('createTestForm')?.addEventListener('submit', handleCreateTest);
    console.log('✅ Create Test page initialized');
}

function resetCreateTestForm() {
    const form = document.getElementById('createTestForm');
    if (form) {
        form.reset();
        // Reset all checkboxes to checked
        form.querySelectorAll('input[name="sections"]').forEach(cb => cb.checked = true);
    }
}

function handleCreateTest(e) {
    e.preventDefault();
    
    // Get selected sections
    const selectedSections = Array.from(
        document.querySelectorAll('input[name="sections"]:checked')
    ).map(cb => cb.value);
    
    if (selectedSections.length === 0) {
        if (typeof AdminUtils !== 'undefined') {
            AdminUtils.showToast('Please select at least one section', 'error');
        } else {
            alert('Please select at least one section');
        }
        return;
    }
    
    const test = {
        id: Date.now(),
        name: document.getElementById('testName').value,
        examType: document.getElementById('examType').value,
        sections: selectedSections,
        duration: parseInt(document.getElementById('testDuration').value),
        totalMarks: parseInt(document.getElementById('totalMarks').value),
        date: document.getElementById('testDate').value,
        time: document.getElementById('testTime').value,
        description: document.getElementById('testDescription').value,
        status: 'Scheduled',
        createdAt: new Date().toISOString()
    };
    
    const tests = JSON.parse(localStorage.getItem('tests') || '[]');
    tests.push(test);
    localStorage.setItem('tests', JSON.stringify(tests));
    
    if (typeof AdminUtils !== 'undefined') {
        AdminUtils.showToast(`Test created successfully! Sections: ${selectedSections.join(', ')}`, 'success');
    } else {
        alert('Test created successfully!');
    }
    
    resetCreateTestForm();
}

if (document.getElementById('create-test-page')) {
    initCreateTest();
}