/**
 * 🎯 COMPLETE ADMIN QUESTION MANAGEMENT SYSTEM
 * 
 * Flow: Admin fills form → Backend saves to MySQL → Student sees questions
 * 
 * Features:
 * ✅ Proper exam type selection (IISER/ISI/NEST)
 * ✅ Year selection (2018-2025)
 * ✅ Subject selection (Physics/Chemistry/Math/Biology)
 * ✅ Auto-generates testId (e.g., IISER_2025, ISI_2025_A)
 * ✅ Question number auto-increment
 * ✅ LaTeX support
 * ✅ Validation before submission
 */

function initAddQuestions() {
    console.log('🎯 Initializing Complete Admin Question System...');

    const container = document.getElementById('add-questions-page');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <h2><i class="fas fa-plus-circle"></i> Add New Question</h2>
            <p>Add questions to your question bank - Students will see these in exams</p>
        </div>
        
        <div class="form-container" style="max-width: 1000px; margin: 0 auto;">
            <form id="addQuestionForm" style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- EXAM METADATA SECTION -->
                <div class="form-section">
                    <h3 style="margin-bottom: 24px; color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 12px;">
                        <i class="fas fa-graduation-cap"></i> Exam Details
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div class="form-group">
                            <label for="examType">Exam Type *</label>
                            <select id="examType" required class="form-input">
                                <option value="">Select Exam Type</option>
                                <option value="IISER">IISER IAT</option>
                                <option value="ISI">ISI Admissions</option>
                                <option value="NEST">NEST</option>
                            </select>
                            <small style="color: #64748b;">Which exam is this question for?</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="examYear">Year *</label>
                            <select id="examYear" required class="form-input">
                                <option value="">Select Year</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                                <option value="2022">2022</option>
                                <option value="2021">2021</option>
                                <option value="2020">2020</option>
                                <option value="2019">2019</option>
                                <option value="2018">2018</option>
                            </select>
                            <small style="color: #64748b;">Exam year</small>
                        </div>
                        
                        <div class="form-group" id="paperTypeGroup" style="display: none;">
                            <label for="paperType">Paper Type *</label>
                            <select id="paperType" class="form-input">
                                <option value="">Select Paper</option>
                                <option value="A">Paper A (MCQ)</option>
                                <option value="B">Paper B (Subjective)</option>
                            </select>
                            <small style="color: #64748b;">For ISI only</small>
                        </div>
                    </div>
                    
                    <div style="padding: 16px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 8px; margin-top: 16px;">
                        <strong style="color: #1e40af;">📝 Generated Test ID:</strong>
                        <code id="generatedTestId" style="font-size: 16px; color: #059669; font-weight: bold; margin-left: 12px;">
                            Select exam details first
                        </code>
                    </div>
                </div>
                
                <!-- QUESTION DETAILS SECTION -->
                <div class="form-section" style="margin-top: 32px;">
                    <h3 style="margin-bottom: 24px; color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 12px;">
                        <i class="fas fa-info-circle"></i> Question Details
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div class="form-group">
                            <label for="subject">Subject/Section *</label>
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
                            <input type="number" id="questionNumber" required class="form-input" min="1" max="120" placeholder="e.g., 1">
                            <small style="color: #64748b;">Position in the exam (1-120)</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="marks">Marks *</label>
                            <input type="number" id="marks" required class="form-input" value="4" min="1" max="10" step="0.5">
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label for="difficulty">Difficulty Level</label>
                            <select id="difficulty" class="form-input">
                                <option value="Easy">Easy</option>
                                <option value="Medium" selected>Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="topic">Topic (Optional)</label>
                            <input type="text" id="topic" class="form-input" placeholder="e.g., Mechanics, Algebra">
                        </div>
                    </div>
                </div>
                
                <!-- QUESTION TEXT SECTION -->
                <div class="form-section" style="margin-top: 32px;">
                    <h3 style="margin-bottom: 24px; color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 12px;">
                        <i class="fas fa-question-circle"></i> Question Text
                    </h3>
                    
                    <div class="form-group">
                        <label for="questionText">Question *</label>
                        <textarea id="questionText" required class="form-input" rows="5" placeholder="Enter your question here...

Tip: You can use LaTeX for math:
- Inline: $x^2 + y^2 = z^2$
- Display: $$\\frac{a}{b} = \\frac{c}{d}$$"></textarea>
                        <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                            <small style="color: #64748b;">
                                <i class="fas fa-lightbulb"></i> LaTeX supported for mathematical expressions
                            </small>
                            <small id="charCount" style="color: #64748b;">0 characters</small>
                        </div>
                    </div>
                </div>
                
                <!-- OPTIONS SECTION (MCQ) -->
                <div class="form-section" id="mcqOptions" style="margin-top: 32px;">
                    <h3 style="margin-bottom: 24px; color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 12px;">
                        <i class="fas fa-list"></i> Answer Options (MCQ)
                    </h3>
                    
                    <div style="display: grid; gap: 16px;">
                        <div class="form-group">
                            <label for="optionA">
                                <span style="display: inline-block; width: 32px; height: 32px; background: #3b82f6; color: white; text-align: center; line-height: 32px; border-radius: 6px; margin-right: 8px;">A</span>
                                Option A *
                            </label>
                            <input type="text" id="optionA" required class="form-input" placeholder="Enter option A">
                        </div>
                        
                        <div class="form-group">
                            <label for="optionB">
                                <span style="display: inline-block; width: 32px; height: 32px; background: #10b981; color: white; text-align: center; line-height: 32px; border-radius: 6px; margin-right: 8px;">B</span>
                                Option B *
                            </label>
                            <input type="text" id="optionB" required class="form-input" placeholder="Enter option B">
                        </div>
                        
                        <div class="form-group">
                            <label for="optionC">
                                <span style="display: inline-block; width: 32px; height: 32px; background: #f59e0b; color: white; text-align: center; line-height: 32px; border-radius: 6px; margin-right: 8px;">C</span>
                                Option C *
                            </label>
                            <input type="text" id="optionC" required class="form-input" placeholder="Enter option C">
                        </div>
                        
                        <div class="form-group">
                            <label for="optionD">
                                <span style="display: inline-block; width: 32px; height: 32px; background: #ef4444; color: white; text-align: center; line-height: 32px; border-radius: 6px; margin-right: 8px;">D</span>
                                Option D *
                            </label>
                            <input type="text" id="optionD" required class="form-input" placeholder="Enter option D">
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-top: 24px;">
                        <label for="correctAnswer">
                            <i class="fas fa-check-circle" style="color: #10b981;"></i> Correct Answer *
                        </label>
                        <select id="correctAnswer" required class="form-input" style="font-size: 16px; font-weight: 600;">
                            <option value="">Select correct answer</option>
                            <option value="A">A - First Option</option>
                            <option value="B">B - Second Option</option>
                            <option value="C">C - Third Option</option>
                            <option value="D">D - Fourth Option</option>
                        </select>
                    </div>
                </div>
                
                <!-- EXPLANATION SECTION (Optional) -->
                <div class="form-section" style="margin-top: 32px;">
                    <h3 style="margin-bottom: 24px; color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 12px;">
                        <i class="fas fa-lightbulb"></i> Explanation (Optional)
                    </h3>
                    
                    <div class="form-group">
                        <label for="explanation">Solution/Explanation</label>
                        <textarea id="explanation" class="form-input" rows="4" placeholder="Provide a detailed explanation for the correct answer..."></textarea>
                        <small style="color: #64748b;">This will help students understand the solution</small>
                    </div>
                </div>
                
                <!-- SUBMIT BUTTONS -->
                <div style="margin-top: 40px; display: flex; gap: 16px; justify-content: flex-end; border-top: 2px solid #e2e8f0; padding-top: 24px;">
                    <button type="button" id="resetBtn" class="btn-secondary">
                        <i class="fas fa-redo"></i> Reset Form
                    </button>
                    <button type="button" id="previewBtn" class="btn-secondary">
                        <i class="fas fa-eye"></i> Preview Question
                    </button>
                    <button type="submit" id="submitQuestionBtn" class="btn-primary">
                        <i class="fas fa-save"></i> Save Question
                    </button>
                </div>
            </form>
        </div>
        
        <style>
            .form-group { margin-bottom: 20px; }
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
            .form-section { 
                border-bottom: 1px solid #e2e8f0; 
                padding-bottom: 32px; 
            }
            .form-section:last-child { border-bottom: none; }
            
            .btn-primary { 
                padding: 12px 32px; 
                background: #6366f1; 
                color: white; 
                border: none; 
                border-radius: 8px; 
                font-weight: 600; 
                cursor: pointer; 
                transition: all 0.3s;
                font-size: 15px;
            }
            .btn-primary:hover { 
                background: #4f46e5; 
                transform: translateY(-1px); 
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
                font-size: 15px;
            }
            .btn-secondary:hover { 
                background: #e2e8f0; 
            }
            
            .page-header { margin-bottom: 32px; }
            .page-header h2 { 
                font-size: 28px; 
                color: #0f172a; 
                margin-bottom: 8px; 
            }
            .page-header p { 
                color: #64748b; 
                font-size: 16px; 
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
            @keyframes spin { to { transform: rotate(360deg); } }
        </style>
    `;

    // ========================================
    // FORM HANDLERS
    // ========================================

    const form = document.getElementById('addQuestionForm');
    const examTypeSelect = document.getElementById('examType');
    const examYearSelect = document.getElementById('examYear');
    const paperTypeGroup = document.getElementById('paperTypeGroup');
    const paperTypeSelect = document.getElementById('paperType');
    const generatedTestIdDisplay = document.getElementById('generatedTestId');
    const questionTextArea = document.getElementById('questionText');
    const charCountDisplay = document.getElementById('charCount');
    const resetBtn = document.getElementById('resetBtn');
    const previewBtn = document.getElementById('previewBtn');

    // Update Test ID when exam details change
    function updateTestId() {
        const examType = examTypeSelect.value;
        const year = examYearSelect.value;
        const paperType = paperTypeSelect.value;

        if (!examType || !year) {
            generatedTestIdDisplay.textContent = 'Select exam details first';
            generatedTestIdDisplay.style.color = '#64748b';
            return;
        }

        let testId = `${examType}_${year}`;
        if (examType === 'ISI' && paperType) {
            testId += `_${paperType}`;
        }

        generatedTestIdDisplay.textContent = testId;
        generatedTestIdDisplay.style.color = '#059669';
    }

    // Show/hide paper type for ISI
    examTypeSelect.addEventListener('change', () => {
        if (examTypeSelect.value === 'ISI') {
            paperTypeGroup.style.display = 'block';
            paperTypeSelect.required = true;
        } else {
            paperTypeGroup.style.display = 'none';
            paperTypeSelect.required = false;
            paperTypeSelect.value = '';
        }
        updateTestId();
    });

    examYearSelect.addEventListener('change', updateTestId);
    paperTypeSelect.addEventListener('change', updateTestId);

    // Character counter
    questionTextArea.addEventListener('input', () => {
        const count = questionTextArea.value.length;
        charCountDisplay.textContent = `${count} characters`;
    });

    // Reset button
    resetBtn?.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            form.reset();
            updateTestId();
            charCountDisplay.textContent = '0 characters';
        }
    });

    // Preview button (TODO: Implement modal preview)
    previewBtn?.addEventListener('click', () => {
        alert('Preview feature coming soon!');
    });

    // ========================================
    // FORM SUBMISSION
    // ========================================

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitQuestionBtn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div> Saving Question...';

        try {
            // Collect form data
            const examType = examTypeSelect.value.trim();
            const year = examYearSelect.value.trim();
            const paperType = paperTypeSelect.value.trim();
            const subject = document.getElementById('subject').value.trim();
            const questionNumber = parseInt(document.getElementById('questionNumber').value);
            const marks = parseFloat(document.getElementById('marks').value);
            const difficulty = document.getElementById('difficulty').value;
            const topic = document.getElementById('topic').value.trim();
            const questionText = questionTextArea.value.trim();
            const optionA = document.getElementById('optionA').value.trim();
            const optionB = document.getElementById('optionB').value.trim();
            const optionC = document.getElementById('optionC').value.trim();
            const optionD = document.getElementById('optionD').value.trim();
            const correctAnswer = document.getElementById('correctAnswer').value;
            const explanation = document.getElementById('explanation').value.trim();

            // Generate testId
            let testId = `${examType}_${year}`;
            if (examType === 'ISI' && paperType) {
                testId += `_${paperType}`;
            }

            // Validate
            if (!examType || !year || !subject || !questionNumber || !questionText) {
                throw new Error('Please fill all required fields');
            }

            if (!optionA || !optionB || !optionC || !optionD) {
                throw new Error('Please fill all four options');
            }

            if (!correctAnswer) {
                throw new Error('Please select the correct answer');
            }

            if (examType === 'ISI' && !paperType) {
                throw new Error('Please select paper type for ISI exam');
            }

            // Build options array
            const options = [optionA, optionB, optionC, optionD];

            // Prepare payload
            const payload = {
                testId: testId,
                examType: examType,
                year: year,
                paperType: paperType || null,
                questionNumber: questionNumber,
                questionText: questionText,
                options: options,
                correctAnswer: correctAnswer,
                section: subject,
                marks: marks,
                difficulty: difficulty,
                topic: topic || null,
                explanation: explanation || null
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
                window.AdminUtils.showToast(`✅ Question ${questionNumber} added successfully to ${testId}!`, 'success');
            } else {
                alert(`✅ Question added successfully!\n\nTest ID: ${testId}\nQuestion Number: ${questionNumber}\nSubject: ${subject}`);
            }

            // Reset form
            form.reset();
            updateTestId();
            charCountDisplay.textContent = '0 characters';

            // Auto-increment question number
            document.getElementById('questionNumber').value = questionNumber + 1;

        } catch (error) {
            console.error('❌ Error adding question:', error);

            // Show error message
            if (window.AdminUtils && window.AdminUtils.showToast) {
                window.AdminUtils.showToast(`❌ ${error.message}`, 'error');
            } else {
                alert(`❌ Failed to add question:\n\n${error.message}`);
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    console.log('✅ Complete Admin Question System initialized');
}

// Auto-initialize if container exists
if (document.getElementById('add-questions-page')) {
    initAddQuestions();
}

// Export for module usage
if (typeof window !== 'undefined') {
    window.initAddQuestions = initAddQuestions;
}
