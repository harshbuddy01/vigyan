/**
 * Add Questions - Connected to Backend
 */

function initAddQuestionsForm() {
    document.getElementById('addQuestionForm')?.addEventListener('submit', handleQuestionSubmit);
    document.getElementById('questionText')?.addEventListener('input', updatePreview);
}

function updatePreview() {
    const text = document.getElementById('questionText').value;
    const preview = document.getElementById('questionPreview');
    if (preview) preview.textContent = text || 'Preview will appear here...';
}

async function handleQuestionSubmit(e) {
    e.preventDefault();
    
    const formData = {
        subject: document.getElementById('subject').value,
        topic: document.getElementById('topic').value,
        difficulty: document.getElementById('difficulty').value,
        marks: parseInt(document.getElementById('marks').value),
        questionType: document.getElementById('questionType').value,
        questionText: document.getElementById('questionText').value,
        option1: document.getElementById('option1')?.value,
        option2: document.getElementById('option2')?.value,
        option3: document.getElementById('option3')?.value,
        option4: document.getElementById('option4')?.value,
        correctAnswer: document.getElementById('correctAnswer')?.value,
        explanation: document.getElementById('explanation')?.value
    };
    
    const submitBtn = document.getElementById('submitQuestionBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> Adding Question...';
    
    try {
        await AdminAPI.addQuestion(formData);
        AdminUtils.showToast('Question added successfully!', 'success');
        document.getElementById('addQuestionForm').reset();
    } catch (error) {
        console.error('Error adding question:', error);
        AdminUtils.showToast('Failed to add question', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Question';
    }
}

if (document.getElementById('addQuestionForm')) initAddQuestionsForm();