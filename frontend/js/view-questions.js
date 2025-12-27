/**
 * View/Edit Questions Handler
 */

let questionsData = [];
let currentFilter = { subject: 'all', difficulty: 'all', search: '' };

const mockQuestionsData = [
    {
        id: 1,
        subject: 'Physics',
        topic: 'Mechanics',
        difficulty: 'Easy',
        marks: 1,
        question: 'What is the SI unit of force?',
        type: 'MCQ'
    },
    {
        id: 2,
        subject: 'Mathematics',
        topic: 'Calculus',
        difficulty: 'Medium',
        marks: 3,
        question: 'Find the derivative of f(x) = x³ + 2x² - 5x + 7',
        type: 'MCQ'
    },
    {
        id: 3,
        subject: 'Chemistry',
        topic: 'Organic Chemistry',
        difficulty: 'Hard',
        marks: 5,
        question: 'Describe the mechanism of SN1 and SN2 reactions',
        type: 'Descriptive'
    }
];

function initViewQuestions() {
    questionsData = mockQuestionsData;
    renderQuestionsTable();
    
    // Filter events
    document.getElementById('subjectFilter')?.addEventListener('change', (e) => {
        currentFilter.subject = e.target.value;
        renderQuestionsTable();
    });
    
    document.getElementById('difficultyFilter')?.addEventListener('change', (e) => {
        currentFilter.difficulty = e.target.value;
        renderQuestionsTable();
    });
    
    document.getElementById('searchQuestions')?.addEventListener('input', (e) => {
        currentFilter.search = e.target.value.toLowerCase();
        renderQuestionsTable();
    });
}

function renderQuestionsTable() {
    const tbody = document.getElementById('questionsTableBody');
    if (!tbody) return;
    
    let filtered = questionsData.filter(q => {
        const matchSubject = currentFilter.subject === 'all' || q.subject === currentFilter.subject;
        const matchDifficulty = currentFilter.difficulty === 'all' || q.difficulty === currentFilter.difficulty;
        const matchSearch = !currentFilter.search || q.question.toLowerCase().includes(currentFilter.search) || q.topic.toLowerCase().includes(currentFilter.search);
        return matchSubject && matchDifficulty && matchSearch;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">No questions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(q => `
        <tr>
            <td>${q.id}</td>
            <td><span class="badge badge-${q.subject.toLowerCase()}">${q.subject}</span></td>
            <td>${q.topic}</td>
            <td><span class="difficulty-${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
            <td>${q.marks}</td>
            <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${q.question}</td>
            <td>
                <button class="action-btn" onclick="editQuestion(${q.id})" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn danger" onclick="deleteQuestion(${q.id})" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function editQuestion(id) {
    AdminUtils.showToast('Edit question form coming soon!', 'success');
}

function deleteQuestion(id) {
    AdminUtils.showConfirmModal(
        'Are you sure you want to delete this question?',
        () => {
            questionsData = questionsData.filter(q => q.id !== id);
            renderQuestionsTable();
            AdminUtils.showToast('Question deleted successfully', 'success');
        }
    );
}

if (document.getElementById('questionsTableBody')) {
    initViewQuestions();
}