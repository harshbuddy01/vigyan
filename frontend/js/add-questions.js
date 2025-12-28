/**
 * Add Questions Page - Complete Backend Integration
 * Fixed: Properly sends data to /api/admin/questions endpoint
 */

function initAddQuestions() {
    console.log('Initializing Add Questions page...');
    
    const container = document.getElementById('add-questions-page');
    if (!container) return;
    
    container.innerHTML = `
        <div class="page-header">
            <h2>Add New Question</h2>
            <p>Add questions to your question bank</p>
        </div>
        
        <div class="form-container" style="max-width: 900px; margin: 0 auto;">
            <form id="addQuestionForm" style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                
                <!-- Question Details -->
                <div class="form-section">
                    <h3 style="margin-bottom: 20px; color: #0f172a;"><i class="fas fa-info-circle"></i> Question Details</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div class="form-group">
                            <label for="testId">Test ID *</label>
                            <input type="text" id="testId" required class="form-input" placeholder="e.g., NEST_2025_01">
                            <small style="color: #64748b;">Enter the test ID this question belongs to</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="subject">Subject/Section *</label>
                            <select id="subject" required class="form-input">
                                <option value="">Select Subject</option>
                                <option value="Physics">Physics</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div class="form-group">
                            <label for="topic">Topic</label>
                            <input type="text" id="topic" class="form-input" placeholder="e.g., Mechanics, Algebra">
                        </div>
                        
                        <div class="form-group">
                            <label for="difficulty">Difficulty</label>
                            <select id="difficulty" class="form-input">
                                <option value="Easy">Easy</option>
                                <option value="Medium" selected>Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="marks">Marks *</label>
                            <input type="number" id="marks" required class="form-input" value="4" min="1" max="10">
                        </div>
                    </div>
                </div>
                
                <!-- Question Text -->
                <div class="form-section" style="margin-top: 24px;">
                    <h3 style="margin-bottom: 20px; color: #0f172a;"><i class="fas fa-question-circle"></i> Question Text</h3>
                    
                    <div class="form-group">
                        <label for="questionText">Question *</label>
                        <textarea id="questionText" required class="form-input" rows="4" placeholder="Enter your question here..."></textarea>
                        <small style="color: #64748b;">Tip: You can use LaTeX for mathematical expressions (e.g., $$x^2 + y^2 = z^2$$)</small>
                    </div>
                </div>
                
                <!-- Options (MCQ) -->
                <div class="form-section" id="mcqOptions" style="margin-top: 24px;">
                    <h3 style="margin-bottom: 20px; color: #0f172a;"><i class="fas fa-list"></i> Answer Options</h3>
                    
                    <div style="display: grid; gap: 16px;">
                        <div class="form-group">
                            <label for="optionA">Option A *</label>
                            <input type="text" id="optionA" required class="form-input" placeholder="Option A">
                        </div>
                        
                        <div class="form-group">
                            <label for="optionB">Option B *</label>
                            <input type="text" id="optionB" required class="form-input" placeholder="Option B">
                        </div>
                        
                        <div class="form-group">
                            <label for="optionC">Option C *</label>
                            <input type="text" id="optionC" required class="form-input" placeholder="Option C">
                        </div>
                        
                        <div class="form-group">
                            <label for="optionD">Option D *</label>
                            <input type="text" id="optionD" required class="form-input" placeholder="Option D">
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
                
                <!-- Explanation -->
                <div class="form-section" style="margin-top: 24px;">
                    <h3 style="margin-bottom: 20px; color: #0f172a;"><i class="fas fa-lightbulb"></i> Explanation (Optional)</h3>
                    
                    <div class="form-group">
                        <label for="explanation">Explanation</label>
                        <textarea id="explanation" class="form-input" rows="3" placeholder="Provide an explanation for the answer..."></textarea>
                    </div>
                </div>
                
                <!-- Submit Button -->
                <div style="margin-top: 32px; display: flex; gap: 12px; justify-content: flex-end;">
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
            .form-group { margin-bottom: 16px; }
            .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #334155; font-size: 14px; }
            .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: all 0.3s; }
            .form-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
            .form-section { border-bottom: 1px solid #e2e8f0; padding-bottom: 24px; }
            .form-section:last-child { border-bottom: none; }
            .btn-primary { padding: 12px 24px; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
            .btn-primary:hover { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); }
            .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; transform: none; }
            .btn-secondary { padding: 12px 24px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
            .btn-secondary:hover { background: #e2e8f0; }
            .page-header { margin-bottom: 32px; }
            .page-header h2 { font-size: 28px; color: #0f172a; margin-bottom: 8px; }
            .page-header p { color: #64748b; font-size: 16px; }
            .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #ffffff; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
            @keyframes spin { to { transform: rotate(360deg); } }
        </style>
    `;
    
    // Initialize form handlers
    const form = document.getElementById('addQuestionForm');
    const resetBtn = document.getElementById('resetBtn');
    
    // Handle reset
    resetBtn?.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the form?')) {
            form.reset();
        }
    });
    
    // Handle form submit
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitQuestionBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div> Adding Question...';
        
        try {
            // Collect form data
            const testId = document.getElementById('testId').value.trim();
            const questionText = document.getElementById('questionText').value.trim();
            const section = document.getElementById('subject').value;
            const marks = parseInt(document.getElementById('marks').value) || 4;
            const correctAnswer = document.getElementById('correctAnswer').value;
            
            // Build options array
            const options = [
                document.getElementById('optionA').value.trim(),
                document.getElementById('optionB').value.trim(),
                document.getElementById('optionC').value.trim(),
                document.getElementById('optionD').value.trim()
            ];
            
            // Validate
            if (!testId || !questionText || !section || !correctAnswer) {
                throw new Error('Please fill all required fields');
            }
            
            if (options.some(opt => !opt)) {
                throw new Error('Please fill all four options');
            }
            
            // Prepare payload matching server.js expectations
            const payload = {
                testId: testId,
                questionText: questionText,
                options: options,
                correctAnswer: correctAnswer,
                section: section,
                marks: marks
            };
            
            console.log('📤 Sending question to backend:', payload);
            
            // Send to backend
            const API_BASE_URL = window.API_BASE_URL || 'https://iin-production.up.railway.app';
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
                window.AdminUtils.showToast('✅ Question added successfully!', 'success');
            } else {
                alert('✅ Question added successfully!');
            }
            
            // Reset form
            form.reset();
            
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
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Question';
        }
    });
    
    console.log('✅ Add Questions page initialized');
}

// Auto-initialize if container exists
if (document.getElementById('add-questions-page')) {
    initAddQuestions();
}

// Export for module usage
if (typeof window !== 'undefined') {
    window.initAddQuestions = initAddQuestions;
}