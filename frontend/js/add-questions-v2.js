/**
 * Add Questions Page V2 - Complete Admin to Student Flow
 * Properly integrates with exam structure (IISER/ISI/NEST + Year + Subject)
 * Created: 2025-12-30
 */

function initAddQuestions() {
    console.log('🚀 Initializing Add Questions V2 page...');

    const container = document.getElementById('add-questions-page');
    if (!container) {
        console.error('❌ add-questions-page container not found');
        return;
    }

    container.innerHTML = `
        <div class="page-header">
            <h2><i class="fas fa-plus-circle"></i> Add New Question</h2>
            <p>Add questions to your question bank for student exams</p>
        </div>
        
        <div class="form-container" style="max-width: 1000px; margin: 0 auto;">
            <form id="addQuestionForm" style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                
                <!-- Exam Configuration -->
                <div class="form-section">
                    <h3 style="margin-bottom: 20px; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-cog" style="color: #6366f1;"></i> 
                        Exam Configuration
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div class="form-group">
                            <label for="examType">Exam Type *</label>
                            <select id="examType" required class="form-input" onchange="updateTestIdPreview()">
                                <option value="">Select Exam</option>
                                <option value="IISER">IISER IAT</option>
                                <option value="ISI">ISI UG (B.Stat/B.Math)</option>
                                <option value="NEST">NEST</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="examYear">Year *</label>
                            <select id="examYear" required class="form-input" onchange="updateTestIdPreview()">
                                <option value="">Select Year</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                                <option value="2022">2022</option>
                                <option value="2021">2021</option>
                                <option value="2020">2020</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="paperTypeGroup" style="display: none;">
                            <label for="paperType">Paper Type (ISI Only)</label>
                            <select id="paperType" class="form-input" onchange="updateTestIdPreview()">
                                <option value="">Not Applicable</option>
                                <option value="A">Paper A (MCQ)</option>
                                <option value="B">Paper B (Subjective)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="background: #f0f9ff; border: 2px solid #0284c7; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <i class="fas fa-info-circle" style="color: #0284c7; font-size: 20px;"></i>
                            <strong style="color: #0c4a6e;">Generated Test ID:</strong>
                        </div>
                        <div id="testIdPreview" style="font-size: 24px; font-weight: bold; color: #0284c7; font-family: monospace;">
                            Select exam type and year
                        </div>
                        <small style="color: #075985; margin-top: 8px; display: block;">
                            This will be used to group questions for student exams
                        </small>
                    </div>
                </div>
                
                <!-- Question Details -->
                <div class="form-section" style="margin-top: 24px;">
                    <h3 style="margin-bottom: 20px; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-list-ol" style="color: #10b981;"></i> 
                        Question Details
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div class="form-group">
                            <label for="subject">Subject *</label>
                            <select id="subject" required class="form-input">
                                <option value="">Select Subject</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Biology">Biology</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="questionNumber">Question Number *</label>
                            <input type="number" id="questionNumber" required class="form-input" min="1" placeholder="e.g., 1, 2, 3...">
                            <small style="color: #64748b;">Unique within this test</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="marks">Marks *</label>
                            <input type="number" id="marks" required class="form-input" value="4" min="1" max="10">
                        </div>
                    </div>
                </div>
                
                <!-- Question Text -->
                <div class="form-section" style="margin-top: 24px;">
                    <h3 style="margin-bottom: 20px; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-question-circle" style="color: #f59e0b;"></i> 
                        Question Text
                    </h3>
                    
                    <div class="form-group">
                        <label for="questionText">Question *</label>
                        <textarea id="questionText" required class="form-input" rows="5" 
                            placeholder="Enter your question here. You can use LaTeX for math expressions (e.g., $$x^2 + y^2 = z^2$$)"></textarea>
                        <small style="color: #64748b;">
                            <i class="fas fa-lightbulb"></i> 
                            Tip: Use $$....$$ for LaTeX math expressions
                        </small>
                    </div>
                </div>
                
                <!-- Options (MCQ) -->
                <div class="form-section" id="mcqOptions" style="margin-top: 24px;">
                    <h3 style="margin-bottom: 20px; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-check-square" style="color: #8b5cf6;"></i> 
                        Answer Options
                    </h3>
                    
                    <div style="display: grid; gap: 16px;">
                        <div class="form-group">
                            <label for="optionA">Option A *</label>
                            <input type="text" id="optionA" required class="form-input" placeholder="Enter option A">
                        </div>
                        
                        <div class="form-group">
                            <label for="optionB">Option B *</label>
                            <input type="text" id="optionB" required class="form-input" placeholder="Enter option B">
                        </div>
                        
                        <div class="form-group">
                            <label for="optionC">Option C *</label>
                            <input type="text" id="optionC" required class="form-input" placeholder="Enter option C">
                        </div>
                        
                        <div class="form-group">
                            <label for="optionD">Option D *</label>
                            <input type="text" id="optionD" required class="form-input" placeholder="Enter option D">
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-top: 20px;">
                        <label for="correctAnswer">Correct Answer *</label>
                        <select id="correctAnswer" required class="form-input">
                            <option value="">Select correct answer</option>
                            <option value="A">Option A</option>
                            <option value="B">Option B</option>
                            <option value="C">Option C</option>
                            <option value="D">Option D</option>
                        </select>
                    </div>
                </div>
                
                <!-- Submit Buttons -->
                <div style="margin-top: 32px; display: flex; gap: 12px; justify-content: flex-end; padding-top: 24px; border-top: 2px solid #e2e8f0;">
                    <button type="button" id="resetBtn" class="btn-secondary">
                        <i class="fas fa-redo"></i> Reset Form
                    </button>
                    <button type="submit" id="submitQuestionBtn" class="btn-primary">
                        <i class="fas fa-plus"></i> Add Question
                    </button>
                </div>
            </form>
        </div>
        
        <style>
            .form-section { 
                border-bottom: 2px solid #e2e8f0; 
                padding-bottom: 24px; 
                margin-bottom: 24px;
            }
            .form-section:last-child { border-bottom: none; }
            
            .form-group { margin-bottom: 16px; }
            .form-group label { 
                display: block; 
                margin-bottom: 8px; 
                font-weight: 600; 
                color: #334155; 
                font-size: 14px; 
            }
            
            .form-input { 
                width: 100%; 
                padding: 12px 16px; 
                border: 2px solid #e2e8f0; 
                border-radius: 8px; 
                font-size: 14px; 
                transition: all 0.3s;
                font-family: inherit;
            }
            .form-input:focus { 
                outline: none; 
                border-color: #6366f1; 
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); 
            }
            
            .btn-primary { 
                padding: 12px 24px; 
                background: #6366f1; 
                color: white; 
                border: none; 
                border-radius: 8px; 
                font-weight: 600; 
                cursor: pointer; 
                transition: all 0.3s;
                font-size: 14px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            .btn-primary:hover { 
                background: #4f46e5; 
                transform: translateY(-2px); 
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); 
            }
            .btn-primary:disabled { 
                background: #94a3b8; 
                cursor: not-allowed; 
                transform: none; 
            }
            
            .btn-secondary { 
                padding: 12px 24px; 
                background: #f1f5f9; 
                color: #475569; 
                border: none; 
                border-radius: 8px; 
                font-weight: 600; 
                cursor: pointer; 
                transition: all 0.3s;
                font-size: 14px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            .btn-secondary:hover { 
                background: #e2e8f0; 
            }
            
            .spinner { 
                display: inline-block; 
                width: 16px; 
                height: 16px; 
                border: 2px solid #ffffff; 
                border-top-color: transparent; 
                border-radius: 50%; 
                animation: spin 0.6s linear infinite; 
            }
            
            @keyframes spin { 
                to { transform: rotate(360deg); } 
            }
        </style>
    `;

    // Show/hide Paper Type for ISI
    document.getElementById('examType')?.addEventListener('change', function () {
        const paperTypeGroup = document.getElementById('paperTypeGroup');
        if (this.value === 'ISI') {
            paperTypeGroup.style.display = 'block';
            document.getElementById('paperType').required = true;
        } else {
            paperTypeGroup.style.display = 'none';
            document.getElementById('paperType').required = false;
            document.getElementById('paperType').value = '';
        }
    });

    // Handle reset
    document.getElementById('resetBtn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the form?')) {
            document.getElementById('addQuestionForm').reset();
            document.getElementById('testIdPreview').textContent = 'Select exam type and year';
            document.getElementById('paperTypeGroup').style.display = 'none';
        }
    });

    // Handle form submit
    document.getElementById('addQuestionForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitQuestionBtn');
        const originalContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div> Adding Question...';

        try {
            // Collect form data
            const examType = document.getElementById('examType').value;
            const examYear = document.getElementById('examYear').value;
            const paperType = document.getElementById('paperType').value;
            const subject = document.getElementById('subject').value;
            const questionNumber = parseInt(document.getElementById('questionNumber').value);
            const marks = parseInt(document.getElementById('marks').value);
            const questionText = document.getElementById('questionText').value.trim();
            const correctAnswer = document.getElementById('correctAnswer').value;

            // Build options array
            const options = [
                document.getElementById('optionA').value.trim(),
                document.getElementById('optionB').value.trim(),
                document.getElementById('optionC').value.trim(),
                document.getElementById('optionD').value.trim()
            ];

            // Validate
            if (!examType || !examYear || !subject || !questionNumber || !questionText || !correctAnswer) {
                throw new Error('Please fill all required fields');
            }

            if (options.some(opt => !opt)) {
                throw new Error('Please fill all four options');
            }

            // Generate testId
            let testId = `${examType}_${examYear}`;
            if (paperType) {
                testId += `_${paperType}`;
            }

            // Prepare payload matching backend expectations
            const payload = {
                testId: testId,
                questionNumber: questionNumber,
                questionText: questionText,
                options: options,
                correctAnswer: correctAnswer,
                section: subject,
                marks: marks
            };

            console.log('📤 Sending question to backend:', payload);

            // Send to backend
            const API_BASE_URL = window.API_BASE_URL || 'https://backend-vigyanpreap.vigyanprep.com';
            const response = await fetch(`${API_BASE_URL}/api/admin/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log('📥 Response status:', response.status);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || error.message || 'Failed to add question');
            }

            const result = await response.json();
            console.log('✅ Question added:', result);

            // Show success message
            if (window.AdminUtils && window.AdminUtils.showToast) {
                window.AdminUtils.showToast(`✅ Question ${questionNumber} added successfully for ${testId}!`, 'success');
            } else {
                alert(`✅ Question ${questionNumber} added successfully for ${testId}!`);
            }

            // Reset form
            document.getElementById('addQuestionForm').reset();
            document.getElementById('testIdPreview').textContent = 'Select exam type and year';
            document.getElementById('paperTypeGroup').style.display = 'none';

        } catch (error) {
            console.error('❌ Error adding question:', error);

            // Show error message
            if (window.AdminUtils && window.AdminUtils.showToast) {
                window.AdminUtils.showToast(`❌ ${error.message}`, 'error');
            } else {
                alert(`❌ Failed to add question: ${error.message}`);
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    });

    console.log('✅ Add Questions V2 page initialized');
}

// Update Test ID Preview
window.updateTestIdPreview = function () {
    const examType = document.getElementById('examType')?.value;
    const examYear = document.getElementById('examYear')?.value;
    const paperType = document.getElementById('paperType')?.value;
    const preview = document.getElementById('testIdPreview');

    if (!preview) return;

    if (!examType || !examYear) {
        preview.textContent = 'Select exam type and year';
        preview.style.color = '#94a3b8';
        return;
    }

    let testId = `${examType}_${examYear}`;
    if (paperType) {
        testId += `_${paperType}`;
    }

    preview.textContent = testId;
    preview.style.color = '#0284c7';
};

// Auto-initialize if container exists
if (document.getElementById('add-questions-page')) {
    initAddQuestions();
}

// Export for module usage
if (typeof window !== 'undefined') {
    window.initAddQuestions = initAddQuestions;
}