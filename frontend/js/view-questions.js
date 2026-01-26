/**
 * View Questions Page - BACKEND CONNECTED
 * FIXED: 2026-01-25 - Correct endpoint and no fake success messages
 */

let allQuestions = [];

function initViewQuestions() {
    console.log('📋 Initializing View Questions page...');
    renderViewQuestionsPage();
    loadQuestionsFromBackend();
}

function renderViewQuestionsPage() {
    const container = document.getElementById('view-questions-page');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-list"></i> View & Edit Questions</h1>
            <p style="color: #64748b; margin-top: 8px;">Manage your question bank</p>
        </div>
        
        <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
            <select id="subjectFilter" style="padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                <option value="all">All Subjects</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
            </select>
            
            <select id="difficultyFilter" style="padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
            </select>
            
            <input type="text" id="searchQuestions" placeholder="Search questions..." 
                   style="flex: 1; min-width: 200px; padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
            
            <button class="btn-primary" onclick="loadQuestionsFromBackend()">
                <i class="fas fa-sync"></i> Refresh
            </button>
            
            <button class="btn-primary" onclick="exportQuestions()">
                <i class="fas fa-download"></i> Export
            </button>
        </div>
        
        <div class="card" style="overflow-x: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>SUBJECT</th>
                        <th>TOPIC</th>
                        <th>DIFFICULTY</th>
                        <th>MARKS</th>
                        <th>QUESTION</th>
                        <th>TYPE</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody id="questionsTableBody">
                    <tr><td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i><br>
                        Loading questions from database...
                    </td></tr>
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('subjectFilter').addEventListener('change', applyQuestionFilters);
    document.getElementById('difficultyFilter').addEventListener('change', applyQuestionFilters);
    document.getElementById('searchQuestions').addEventListener('input', applyQuestionFilters);
}

async function loadQuestionsFromBackend() {
    try {
        console.log('🔄 Fetching questions from backend...');

        // Ensure AdminAPI is available
        if (!window.AdminAPI) {
            throw new Error('AdminAPI service not found');
        }

        // ✅ FIXED: Use AdminAPI service
        const data = await window.AdminAPI.getQuestions();

        console.log('✅ Backend response:', data);

        // Handle empty database gracefully
        if (!data || (data.success && !data.questions)) {
            console.log('ℹ️ No questions found in database');
            allQuestions = [];
            displayQuestions([]);
            return;
        }

        allQuestions = data.questions || [];
        console.log(`✅ Loaded ${allQuestions.length} questions from backend`);

        displayQuestions(allQuestions);

        // ✅ ONLY show success toast on manual refresh (not on initial load)
        if (window._manualRefresh && window.AdminUtils) {
            window.AdminUtils.showToast(`Loaded ${allQuestions.length} questions`, 'success');
            window._manualRefresh = false;
        }

    } catch (error) {
        console.error('❌ Failed to load questions:', error);

        const tbody = document.getElementById('questionsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr><td colspan="8" style="text-align: center; padding: 40px;">
                    <div style="color: #ef4444; margin-bottom: 16px;">
                        <i class="fas fa-exclamation-circle" style="font-size: 48px;"></i>
                    </div>
                    <h3 style="color: #1e293b; margin-bottom: 8px;">Failed to Load Questions</h3>
                    <p style="color: #64748b; margin-bottom: 16px;">Error: ${error.message}</p>
                    <button class="btn-primary" onclick="refreshQuestionsManually()">
                        <i class="fas fa-sync"></i> Retry
                    </button>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">If problem persists, check backend connection</p>
                </td></tr>
            `;
        }

        // Only show error toast on failures (not on empty database)
        if (window.AdminUtils && error.message.includes('HTTP')) {
            window.AdminUtils.showToast('Failed to load questions from backend', 'error');
        }
    }
}

// Manual refresh function to trigger success toast
function refreshQuestionsManually() {
    window._manualRefresh = true;
    loadQuestionsFromBackend();
}

function applyQuestionFilters() {
    const subject = document.getElementById('subjectFilter').value;
    const difficulty = document.getElementById('difficultyFilter').value;
    const search = document.getElementById('searchQuestions').value.toLowerCase();

    let filtered = allQuestions;

    if (subject !== 'all') {
        filtered = filtered.filter(q => q.subject === subject);
    }
    if (difficulty !== 'all') {
        filtered = filtered.filter(q => q.difficulty === difficulty);
    }
    if (search) {
        filtered = filtered.filter(q =>
            q.question.toLowerCase().includes(search) ||
            q.topic.toLowerCase().includes(search)
        );
    }

    displayQuestions(filtered);
}

function displayQuestions(questions) {
    const tbody = document.getElementById('questionsTableBody');
    if (!tbody) return;

    if (questions.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="8" style="text-align: center; padding: 60px; color: #94a3b8;">
                <i class="fas fa-question-circle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p style="font-size: 18px; margin-bottom: 8px;">No questions found</p>
                <p style="font-size: 14px;">Add questions using the "Add Questions" page</p>
            </td></tr>
        `;
        return;
    }

    tbody.innerHTML = questions.map(q => `
        <tr>
            <td><strong>#${q.id}</strong></td>
            <td><span class="badge badge-${q.subject.toLowerCase()}">${q.subject}</span></td>
            <td>${q.topic || 'N/A'}</td>
            <td><span class="difficulty-${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
            <td><strong>${q.marks}</strong></td>
            <td style="max-width: 400px;">
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${q.question}">
                    ${q.question}
                </div>
            </td>
            <td><span class="badge">${q.type}</span></td>
            <td>
                <button class="action-btn" onclick="viewQuestionDetails(${q.id})" title="View Full Question">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" onclick="editQuestionModal(${q.id})" title="Edit Question">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn danger" onclick="deleteQuestionConfirm(${q.id})" title="Delete Question">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function viewQuestionDetails(id) {
    const question = allQuestions.find(q => q.id === id);
    if (!question) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="width: 700px; max-width: 90vw;">
            <div class="modal-header">
                <h2>Question Details</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div style="padding: 24px;">
                <div style="margin-bottom: 16px;">
                    <strong style="color: #64748b; font-size: 12px;">QUESTION #${question.id}</strong>
                    <p style="font-size: 16px; margin-top: 8px; line-height: 1.6;">${question.question}</p>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <strong style="color: #64748b; font-size: 12px;">OPTIONS</strong>
                    <div style="margin-top: 8px;">
                        ${question.options ? question.options.map((opt, idx) => `
                            <div style="padding: 8px; background: ${question.answer === opt ? '#d1fae5' : '#f8fafc'}; border-radius: 6px; margin-bottom: 4px;">
                                <strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}
                                ${question.answer === opt ? '<i class="fas fa-check" style="color: #10b981; float: right;"></i>' : ''}
                            </div>
                        `).join('') : '<p style="color: #94a3b8;">No options available</p>'}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 16px; background: #f8fafc; border-radius: 8px;">
                    <div>
                        <strong style="color: #64748b; font-size: 12px;">SUBJECT</strong>
                        <p>${question.subject}</p>
                    </div>
                    <div>
                        <strong style="color: #64748b; font-size: 12px;">TOPIC</strong>
                        <p>${question.topic || 'N/A'}</p>
                    </div>
                    <div>
                        <strong style="color: #64748b; font-size: 12px;">DIFFICULTY</strong>
                        <p class="difficulty-${question.difficulty.toLowerCase()}">${question.difficulty}</p>
                    </div>
                    <div>
                        <strong style="color: #64748b; font-size: 12px;">MARKS</strong>
                        <p><strong>${question.marks}</strong></p>
                    </div>
                    <div>
                        <strong style="color: #64748b; font-size: 12px;">TYPE</strong>
                        <p>${question.type}</p>
                    </div>
                    <div>
                        <strong style="color: #64748b; font-size: 12px;">CORRECT ANSWER</strong>
                        <p style="color: #10b981; font-weight: 600;">${question.answer}</p>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function editQuestionModal(id) {
    const question = allQuestions.find(q => q.id === id);
    if (!question) return;

    if (window.AdminUtils) {
        window.AdminUtils.showToast('Edit functionality coming soon!', 'info');
    } else {
        alert('Edit functionality: This will update the question in the backend database.');
    }
    // TODO: Implement edit modal with form
}

async function deleteQuestionConfirm(id) {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;

    try {
        console.log(`🗑️ Deleting question #${id}...`);

        await window.AdminAPI.deleteQuestion(id);

        console.log('✅ Question deleted successfully');
        if (window.AdminUtils) window.AdminUtils.showToast('Question deleted successfully', 'success');
        loadQuestionsFromBackend();

    } catch (error) {
        console.error('❌ Delete error:', error);
        if (window.AdminUtils) {
            window.AdminUtils.showToast('Failed to delete question', 'error');
        } else {
            alert('Failed to delete question. Please try again.');
        }
    }
}

function exportQuestions() {
    if (allQuestions.length === 0) {
        if (window.AdminUtils) {
            window.AdminUtils.showToast('No questions to export', 'warning');
        } else {
            alert('No questions to export');
        }
        return;
    }

    const csv = [
        ['ID', 'Subject', 'Topic', 'Difficulty', 'Marks', 'Question', 'Type', 'Answer'],
        ...allQuestions.map(q => [
            q.id,
            q.subject,
            q.topic || '',
            q.difficulty,
            q.marks,
            `"${q.question.replace(/"/g, '""')}"`,
            q.type,
            q.answer
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    if (window.AdminUtils) window.AdminUtils.showToast('Questions exported successfully', 'success');
}

window.initViewQuestions = initViewQuestions;
window.loadQuestionsFromBackend = loadQuestionsFromBackend;
window.refreshQuestionsManually = refreshQuestionsManually;
window.viewQuestionDetails = viewQuestionDetails;
window.editQuestionModal = editQuestionModal;
window.deleteQuestionConfirm = deleteQuestionConfirm;
window.exportQuestions = exportQuestions;