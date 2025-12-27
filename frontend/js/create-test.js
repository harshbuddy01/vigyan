/**
 * Create Test - Connected to Backend
 */

let selectedQuestions = [];
let currentSubject = 'Physics';
const mockQuestions = {
    Physics: [{ id: 1, text: 'What is the SI unit of force?', difficulty: 'Easy', marks: 1 }],
    Mathematics: [{ id: 4, text: 'Solve: 2x + 5 = 15', difficulty: 'Easy', marks: 1 }],
    Chemistry: [{ id: 7, text: 'Atomic number of Carbon?', difficulty: 'Easy', marks: 1 }]
};

function initCreateTestForm() {
    const subjects = ['Physics', 'Mathematics', 'Chemistry'];
    const subjectTabsContainer = document.getElementById('subjectTabs');
    if (!subjectTabsContainer) return;
    
    subjects.forEach(subject => {
        const tab = document.createElement('button');
        tab.className = `subject-tab ${subject === currentSubject ? 'active' : ''}`;
        tab.textContent = subject;
        tab.type = 'button';
        tab.addEventListener('click', () => switchSubject(subject));
        subjectTabsContainer.appendChild(tab);
    });
    
    loadQuestions();
    document.getElementById('createTestForm')?.addEventListener('submit', handleTestSubmit);
}

function switchSubject(subject) {
    currentSubject = subject;
    document.querySelectorAll('.subject-tab').forEach(tab => {
        tab.classList.toggle('active', tab.textContent === subject);
    });
    loadQuestions();
}

function loadQuestions() {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return;
    const questions = mockQuestions[currentSubject] || [];
    questionsList.innerHTML = questions.map(q => {
        const isSelected = selectedQuestions.some(sq => sq.id === q.id);
        return `<div class="question-item ${isSelected ? 'selected' : ''}"><div class="question-header"><input type="checkbox" class="question-checkbox" id="q${q.id}" ${isSelected ? 'checked' : ''} onchange="toggleQuestion(${q.id}, '${currentSubject}')"><label for="q${q.id}" class="question-text">${q.text}</label></div><div class="question-meta"><span><i class="fas fa-signal"></i> ${q.difficulty}</span><span><i class="fas fa-star"></i> ${q.marks} marks</span></div></div>`;
    }).join('');
    updateSelectedCount();
}

function toggleQuestion(questionId, subject) {
    const question = mockQuestions[subject].find(q => q.id === questionId);
    const index = selectedQuestions.findIndex(q => q.id === questionId);
    if (index > -1) selectedQuestions.splice(index, 1);
    else selectedQuestions.push({ ...question, subject });
    loadQuestions();
}

function updateSelectedCount() {
    const count = selectedQuestions.length;
    const totalMarks = selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
    document.getElementById('selectedCount').textContent = `${count} questions selected (${totalMarks} marks)`;
}

async function handleTestSubmit(e) {
    e.preventDefault();
    if (selectedQuestions.length === 0) {
        AdminUtils.showToast('Please select at least one question', 'error');
        return;
    }
    
    const formData = {
        testName: document.getElementById('testName').value,
        testCode: document.getElementById('testCode').value,
        examType: document.getElementById('examType').value,
        duration: document.getElementById('duration').value,
        totalMarks: document.getElementById('totalMarks').value,
        examDate: document.getElementById('examDate').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        instructions: document.getElementById('instructions').value,
        negativeMarking: document.getElementById('negativeMarking').checked,
        shuffleQuestions: document.getElementById('shuffleQuestions').checked,
        showResults: document.getElementById('showResults').checked,
        questions: selectedQuestions
    };
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> Creating Test...';
    
    try {
        await AdminAPI.createTest(formData);
        AdminUtils.showToast('Test created successfully!', 'success');
        setTimeout(() => {
            document.getElementById('createTestForm').reset();
            selectedQuestions = [];
            updateSelectedCount();
        }, 1000);
    } catch (error) {
        AdminUtils.showToast('Failed to create test', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Create Test';
    }
}

if (document.getElementById('createTestForm')) initCreateTestForm();
window.toggleQuestion = toggleQuestion;