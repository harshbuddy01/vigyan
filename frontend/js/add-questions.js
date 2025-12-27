/**
 * Add Questions Form Handler
 */

function initAddQuestionsForm() {
    // Form submission
    document.getElementById('addQuestionForm')?.addEventListener('submit', handleQuestionSubmit);
    
    // Preview LaTeX
    document.getElementById('questionText')?.addEventListener('input', updatePreview);
}

function updatePreview() {
    const text = document.getElementById('questionText').value;
    const preview = document.getElementById('questionPreview');
    if (preview) {
        preview.textContent = text || 'Preview will appear here...';
    }
}

async function handleQuestionSubmit(e) {
    e.preventDefault();
    
    const formData = {
        subject: document.getElementById('subject').value,
        topic: document.getElementById('topic').value,
        difficulty: document.getElementById('difficulty').value,
        marks: document.getElementById('marks').value,
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        AdminUtils.showToast('Question added successfully!', 'success');
        document.getElementById('addQuestionForm').reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Question';
    } catch (error) {
        AdminUtils.showToast('Failed to add question', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Question';
    }
}

if (document.getElementById('addQuestionForm')) {
    initAddQuestionsForm();
}