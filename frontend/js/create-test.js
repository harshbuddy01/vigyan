/**
 * Create Test Form Handler
 */

let selectedQuestions = [];
let currentSubject = 'Physics';

// Mock questions data (replace with API call)
const mockQuestions = {
    Physics: [
        {
            id: 1,
            text: 'What is the SI unit of force?',
            difficulty: 'Easy',
            marks: 1
        },
        {
            id: 2,
            text: 'Derive the equation of motion for a body under constant acceleration.',
            difficulty: 'Medium',
            marks: 3
        },
        {
            id: 3,
            text: 'Explain the photoelectric effect and its significance.',
            difficulty: 'Hard',
            marks: 5
        }
    ],
    Mathematics: [
        {
            id: 4,
            text: 'Solve the equation: 2x + 5 = 15',
            difficulty: 'Easy',
            marks: 1
        },
        {
            id: 5,
            text: 'Find the derivative of f(x) = x³ + 2x² - 5x + 7',
            difficulty: 'Medium',
            marks: 3
        },
        {
            id: 6,
            text: 'Prove that the sum of angles in a triangle is 180°',
            difficulty: 'Hard',
            marks: 5
        }
    ],
    Chemistry: [
        {
            id: 7,
            text: 'What is the atomic number of Carbon?',
            difficulty: 'Easy',
            marks: 1
        },
        {
            id: 8,
            text: 'Explain the concept of electronegativity.',
            difficulty: 'Medium',
            marks: 3
        },
        {
            id: 9,
            text: 'Describe the mechanism of SN1 and SN2 reactions.',
            difficulty: 'Hard',
            marks: 5
        }
    ]
};

function initCreateTestForm() {
    // Subject tabs
    const subjects = ['Physics', 'Mathematics', 'Chemistry'];
    const subjectTabsContainer = document.getElementById('subjectTabs');
    
    subjects.forEach(subject => {
        const tab = document.createElement('button');
        tab.className = `subject-tab ${subject === currentSubject ? 'active' : ''}`;
        tab.textContent = subject;
        tab.type = 'button';
        tab.addEventListener('click', () => switchSubject(subject));
        subjectTabsContainer.appendChild(tab);
    });
    
    // Load initial questions
    loadQuestions();
    
    // Form submission
    document.getElementById('createTestForm').addEventListener('submit', handleTestSubmit);
}

function switchSubject(subject) {
    currentSubject = subject;
    
    // Update active tab
    document.querySelectorAll('.subject-tab').forEach(tab => {
        tab.classList.toggle('active', tab.textContent === subject);
    });
    
    // Load questions for this subject
    loadQuestions();
}

function loadQuestions() {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';
    
    const questions = mockQuestions[currentSubject] || [];
    
    questions.forEach(question => {
        const isSelected = selectedQuestions.some(q => q.id === question.id);
        
        const questionItem = document.createElement('div');
        questionItem.className = `question-item ${isSelected ? 'selected' : ''}`;
        questionItem.innerHTML = `
            <div class="question-header">
                <input 
                    type="checkbox" 
                    class="question-checkbox" 
                    id="q${question.id}"
                    ${isSelected ? 'checked' : ''}
                    onchange="toggleQuestion(${question.id}, '${currentSubject}')"
                >
                <label for="q${question.id}" class="question-text">
                    ${question.text}
                </label>
            </div>
            <div class="question-meta">
                <span><i class="fas fa-signal"></i> ${question.difficulty}</span>
                <span><i class="fas fa-star"></i> ${question.marks} marks</span>
            </div>
        `;
        
        questionsList.appendChild(questionItem);
    });
    
    updateSelectedCount();
}

function toggleQuestion(questionId, subject) {
    const question = mockQuestions[subject].find(q => q.id === questionId);
    const index = selectedQuestions.findIndex(q => q.id === questionId);
    
    if (index > -1) {
        // Remove question
        selectedQuestions.splice(index, 1);
    } else {
        // Add question
        selectedQuestions.push({ ...question, subject });
    }
    
    loadQuestions();
}

function updateSelectedCount() {
    const count = selectedQuestions.length;
    const totalMarks = selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
    
    document.getElementById('selectedCount').textContent = 
        `${count} questions selected (${totalMarks} marks)`;
}

async function handleTestSubmit(e) {
    e.preventDefault();
    
    // Get form data
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
    
    // Validation
    if (selectedQuestions.length === 0) {
        AdminUtils.showToast('Please select at least one question', 'error');
        return;
    }
    
    // Show loading
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> Creating Test...';
    
    try {
        // Call API to create test
        // const response = await window.adminAPI.createTest(formData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        AdminUtils.showToast('Test created successfully!', 'success');
        
        // Reset form
        setTimeout(() => {
            document.getElementById('createTestForm').reset();
            selectedQuestions = [];
            updateSelectedCount();
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Create Test';
        }, 1000);
        
    } catch (error) {
        console.error('Error creating test:', error);
        AdminUtils.showToast('Failed to create test', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Create Test';
    }
}

// Initialize when page loads
if (document.getElementById('createTestForm')) {
    initCreateTestForm();
}