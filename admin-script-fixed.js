// API Configuration
const API_BASE_URL = "https://backend-vigyanpreap.vigyanprep.com";

// Global variables
let base64Image = "";
let cachedResultsData = [];

// ===== AUTHENTICATION =====
function checkAuth() {
    if (localStorage.getItem("adminKey") !== "secret_unlocked") {
        window.location.href = "adminlogin.html";
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem("adminKey");
        window.location.href = "adminlogin.html";
    }
}

// ===== TIME DISPLAY =====
function updateTime() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    const dateElement = document.getElementById('currentDate');

    if (timeElement) {
        timeElement.innerText = now.toLocaleTimeString();
    }
    if (dateElement) {
        dateElement.innerText = now.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
}

// ===== TAB SWITCHING =====
function switchTab(event, tabName) {
    // Prevent default behavior
    if (event) {
        event.preventDefault();
    }

    // Remove active class from all cards and nav items
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Add active class to selected tab
    const tabElement = document.getElementById(`tab-${tabName}`);
    if (tabElement) {
        tabElement.classList.add('active');
    }

    // Add active class to clicked nav item
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Load data based on tab
    try {
        if (tabName === 'manage') loadAllQuestions();
        if (tabName === 'students') loadStudents();
        if (tabName === 'results') loadResults();
        if (tabName === 'feedbacks') loadFeedbacks();
    } catch (error) {
        console.error('Error switching tab:', error);
        showNotification('Failed to load tab content', 'error');
    }
}

// ===== IMAGE PREVIEW =====
function previewImage() {
    const fileInput = document.getElementById("qImage");
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        showNotification('Please select an image file', 'warning');
        return;
    }

    const file = fileInput.files[0];

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showNotification('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
        fileInput.value = '';
        return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        showNotification('Image size must be less than 5MB', 'error');
        fileInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        base64Image = reader.result;
        const previewImg = document.getElementById("imgPreview");
        const previewContainer = document.getElementById("previewContainer");

        if (previewImg) {
            previewImg.src = base64Image;
        }
        if (previewContainer) {
            previewContainer.classList.add('show');
        }
    };

    reader.onerror = () => {
        showNotification('Failed to read image file', 'error');
        fileInput.value = '';
    };

    reader.readAsDataURL(file);
}

// ===== UPLOAD QUESTION =====
async function uploadQuestion() {
    // Validate inputs
    const testId = document.getElementById("testId")?.value?.trim();
    const subject = document.getElementById("subject")?.value?.trim();
    const questionText = document.getElementById("questionText")?.value?.trim();
    const opt1 = document.getElementById("opt1")?.value?.trim();
    const opt2 = document.getElementById("opt2")?.value?.trim();
    const opt3 = document.getElementById("opt3")?.value?.trim();
    const opt4 = document.getElementById("opt4")?.value?.trim();
    const correctAnswer = document.getElementById("correctAnswer")?.value?.trim();

    // Validation
    if (!testId) {
        showNotification('Please enter Test ID', 'warning');
        return;
    }
    if (!subject) {
        showNotification('Please select a subject', 'warning');
        return;
    }
    if (!questionText) {
        showNotification('Please enter question text', 'warning');
        return;
    }
    if (!opt1 || !opt2 || !opt3 || !opt4) {
        showNotification('Please fill all four options', 'warning');
        return;
    }
    if (!correctAnswer) {
        showNotification('Please enter the correct answer', 'warning');
        return;
    }

    const data = {
        testId,
        subject,
        questionText,
        image: base64Image || '',
        options: [opt1, opt2, opt3, opt4],
        correctAnswer
    };

    try {
        showNotification('Uploading question...', 'info');
        const res = await axios.post(`${API_BASE_URL}/api/upload-question`, data, {
            timeout: 30000 // 30 second timeout
        });

        if (res.data && res.data.success) {
            showNotification('✅ Question successfully deployed to database!', 'success');
            resetForm();
            loadAllQuestions();
            updateStats();
        } else {
            throw new Error(res.data?.message || 'Unknown error occurred');
        }
    } catch (e) {
        console.error('Upload error:', e);
        const errorMsg = e.response?.data?.message || e.message || 'Failed to upload question';
        showNotification('❌ Upload failed: ' + errorMsg, 'error');
    }
}

function resetForm() {
    const fields = ['questionText', 'correctAnswer', 'opt1', 'opt2', 'opt3', 'opt4'];
    fields.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = "";
    });

    const imageInput = document.getElementById("qImage");
    if (imageInput) imageInput.value = "";

    const previewContainer = document.getElementById("previewContainer");
    if (previewContainer) previewContainer.classList.remove('show');

    base64Image = "";
}

// ===== LOAD QUESTIONS =====
async function loadAllQuestions() {
    const tbody = document.getElementById("questionsTable");
    if (!tbody) return;

    tbody.innerHTML = "<tr><td colspan='5' class='loading'><div class='spinner'></div>Loading...</td></tr>";

    try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/all-questions`, {
            timeout: 15000
        });

        if (res.data && res.data.success) {
            const questions = res.data.questions || [];
            tbody.innerHTML = "";

            if (questions.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:40px;'>No questions found</td></tr>";
                return;
            }

            questions.forEach(q => {
                const badgeClass = q.subject === "Physics" ? "badge-phys" :
                    q.subject === "Chemistry" ? "badge-chem" :
                        q.subject === "Mathematics" ? "badge-math" : "badge-bio";

                const questionPreview = sanitizeHTML(q.questionText || '').substring(0, 100);
                const answerPreview = sanitizeHTML(q.correctAnswer || '').substring(0, 30);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><span class="badge ${badgeClass}">${sanitizeHTML(q.subject)}</span></td>
                    <td style="font-size: 0.9rem;">${questionPreview}${q.questionText.length > 100 ? '...' : ''}</td>
                    <td>${q.image ? `<img src="${sanitizeHTML(q.image)}" class="table-img" onclick="window.open(this.src)">` : '-'}</td>
                    <td style="color: var(--success); font-weight: 600;">${answerPreview}${q.correctAnswer.length > 30 ? '...' : ''}</td>
                    <td>
                        <button class="action-btn btn-delete" onclick="deleteQuestion('${q._id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            updateStats();
            if (window.MathJax && window.MathJax.typeset) {
                window.MathJax.typeset();
            }
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (e) {
        console.error('Load questions error:', e);
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color: var(--danger);'>Failed to load questions: " + (e.message || 'Unknown error') + "</td></tr>";
    }
}

async function deleteQuestion(id) {
    if (!id) {
        showNotification('Invalid question ID', 'error');
        return;
    }

    if (!confirm("Are you sure you want to delete this question permanently?")) return;

    try {
        await axios.delete(`${API_BASE_URL}/api/admin/delete-question/${id}`, {
            timeout: 15000
        });
        showNotification('✅ Question deleted successfully', 'success');
        loadAllQuestions();
    } catch (e) {
        console.error('Delete error:', e);
        showNotification('❌ Failed to delete question: ' + (e.message || 'Unknown error'), 'error');
    }
}

// Debounced filter function
let filterTimeout = null;
function filterQuestions() {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
        const searchTerm = (document.getElementById('searchQuestions')?.value || '').toLowerCase().trim();
        const rows = document.querySelectorAll('#questionsTable tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }, 300);
}

// ===== LOAD STUDENTS =====
async function loadStudents() {
    const tbody = document.getElementById("studentsTable");
    if (!tbody) return;

    tbody.innerHTML = "<tr><td colspan='5' class='loading'><div class='spinner'></div>Loading...</td></tr>";

    try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/all-students`, {
            timeout: 15000
        });

        if (res.data && res.data.success) {
            const students = res.data.students || [];
            tbody.innerHTML = "";

            if (students.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:40px;'>No students found</td></tr>";
                return;
            }

            students.forEach(s => {
                const tests = s.purchasedTests && s.purchasedTests.length > 0
                    ? s.purchasedTests.map(t => `<span class="badge" style="margin:2px;">${sanitizeHTML(t.toUpperCase())}</span>`).join(' ')
                    : '<span style="color: var(--text-secondary);">None</span>';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="color: var(--warning); font-weight: 700;">${sanitizeHTML(s.rollNumber || 'N/A')}</td>
                    <td>${sanitizeHTML(s.email || 'N/A')}</td>
                    <td>${tests}</td>
                    <td style="font-size: 0.85rem;">${new Date(s.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td>
                        <button class="action-btn" style="color: var(--accent);" onclick="viewStudentDetails('${s._id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            const statElement = document.getElementById('statStudents');
            if (statElement) {
                statElement.innerText = students.length;
            }
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (e) {
        console.error('Load students error:', e);
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color: var(--danger);'>Failed to load students: " + (e.message || 'Unknown error') + "</td></tr>";
    }
}

function filterStudents() {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
        const searchTerm = (document.getElementById('searchStudents')?.value || '').toLowerCase().trim();
        const rows = document.querySelectorAll('#studentsTable tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }, 300);
}

function viewStudentDetails(id) {
    if (!id) {
        showNotification('Invalid student ID', 'error');
        return;
    }
    showNotification('Student details view - Feature coming soon!', 'info');
}

// ===== LOAD RESULTS =====
async function loadResults() {
    const tbody = document.getElementById("resultsTable");
    if (!tbody) return;

    tbody.innerHTML = "<tr><td colspan='5' class='loading'><div class='spinner'></div>Loading...</td></tr>";

    try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/results`, {
            timeout: 15000
        });

        if (res.data && res.data.success) {
            const { results, questions } = res.data;
            cachedResultsData = { results: results || [], questions: questions || [] };
            tbody.innerHTML = "";

            if (!results || results.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:40px;'>No results found</td></tr>";
                return;
            }

            results.forEach((r, idx) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="color: var(--warning); font-weight: 700;">${sanitizeHTML(r.rollNumber || 'N/A')}</td>
                    <td>${sanitizeHTML(r.email || 'N/A')}</td>
                    <td><span class="badge">${sanitizeHTML((r.testId || '').toUpperCase())}</span></td>
                    <td style="font-size: 0.85rem;">${new Date(r.submissionTime).toLocaleString()}</td>
                    <td>
                        <button class="btn-view" onclick="viewResponseSheet(${idx})">
                            <i class="fas fa-file-alt"></i>
                            View Response
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            const statElement = document.getElementById('statResults');
            if (statElement) {
                statElement.innerText = results.length;
            }
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (e) {
        console.error('Load results error:', e);
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color: var(--danger);'>Failed to load results: " + (e.message || 'Unknown error') + "</td></tr>";
    }
}

function viewResponseSheet(idx) {
    if (!cachedResultsData || !cachedResultsData.results || !cachedResultsData.results[idx]) {
        showNotification('Invalid result data', 'error');
        return;
    }

    const r = cachedResultsData.results[idx];
    const testQs = cachedResultsData.questions.filter(q => q.testId === r.testId);

    let organized = [];
    ["Physics", "Chemistry", "Mathematics", "Biology"].forEach(subject => {
        organized = organized.concat(testQs.filter(q => q.subject === subject));
    });

    let html = `
        <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="color: var(--accent); margin-bottom: 10px;">Student Information</h3>
            <p><strong>Email:</strong> ${sanitizeHTML(r.email || 'N/A')}</p>
            <p><strong>Roll Number:</strong> ${sanitizeHTML(r.rollNumber || 'N/A')}</p>
            <p><strong>Test:</strong> ${sanitizeHTML((r.testId || '').toUpperCase())}</p>
            <p><strong>Submission:</strong> ${new Date(r.submissionTime).toLocaleString()}</p>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Question</th>
                        <th>Student Answer</th>
                        <th>Correct Answer</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
    `;

    let counters = { "Physics": 0, "Chemistry": 0, "Mathematics": 0, "Biology": 0 };
    let totalScore = 0;

    organized.forEach(q => {
        const key = `${q.subject}-${counters[q.subject]}`;
        counters[q.subject]++;

        const userAnswerIndex = r.answers && r.answers[key];
        const userAnswer = userAnswerIndex !== undefined && q.options && q.options[userAnswerIndex] ? q.options[userAnswerIndex] : "SKIPPED";
        const isCorrect = userAnswer === q.correctAnswer;
        const points = userAnswer === "SKIPPED" ? 0 : isCorrect ? 4 : -1;
        totalScore += points;

        const statusColor = userAnswer === "SKIPPED" ? "var(--text-secondary)" : isCorrect ? "var(--success)" : "var(--danger)";
        const statusText = userAnswer === "SKIPPED" ? "0" : isCorrect ? "+4" : "-1";

        const questionPreview = sanitizeHTML(q.questionText || '').substring(0, 80);
        const userAnswerPreview = sanitizeHTML(userAnswer || '').substring(0, 30);
        const correctAnswerPreview = sanitizeHTML(q.correctAnswer || '').substring(0, 30);

        html += `
            <tr>
                <td><span class="badge badge-${(q.subject || '').toLowerCase().substring(0, 4)}">${sanitizeHTML(q.subject || '')}</span></td>
                <td style="font-size: 0.85rem;">${questionPreview}...</td>
                <td>${userAnswerPreview}${userAnswer.length > 30 ? '...' : ''}</td>
                <td style="color: var(--success);">${correctAnswerPreview}${(q.correctAnswer || '').length > 30 ? '...' : ''}</td>
                <td style="color: ${statusColor}; font-weight: 700;">${statusText}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
        
        <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center;">
            <h2 style="color: var(--accent); font-size: 2rem;">Total Score: ${totalScore}</h2>
        </div>
    `;

    const modalStudentName = document.getElementById("modalStudentName");
    const sheetContent = document.getElementById("sheetContent");
    const responseModal = document.getElementById("responseModal");

    if (modalStudentName) {
        modalStudentName.innerHTML = `<i class="fas fa-file-alt"></i> Response Sheet: ${sanitizeHTML(r.email || 'N/A')}`;
    }
    if (sheetContent) {
        sheetContent.innerHTML = html;
    }
    if (responseModal) {
        responseModal.style.display = "flex";
    }

    if (window.MathJax && window.MathJax.typeset) {
        window.MathJax.typeset();
    }
}

// ===== LOAD FEEDBACKS =====
async function loadFeedbacks() {
    const tbody = document.getElementById("feedbackTable");
    if (!tbody) return;

    tbody.innerHTML = "<tr><td colspan='5' class='loading'><div class='spinner'></div>Loading...</td></tr>";

    try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/feedbacks`, {
            timeout: 15000
        });

        if (res.data && res.data.success) {
            const feedbacks = res.data.feedbacks || [];
            tbody.innerHTML = "";

            if (feedbacks.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:40px;'>No feedbacks found</td></tr>";
                return;
            }

            feedbacks.forEach(f => {
                const r = f.ratings || {};
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="color: var(--warning); font-weight: 700;">${sanitizeHTML(f.rollNumber || 'N/A')}</td>
                    <td>${sanitizeHTML(f.email || 'N/A')}<br><small style="color: var(--text-secondary);">${sanitizeHTML((f.testId || '').toUpperCase())}</small></td>
                    <td><span class="badge">${sanitizeHTML((f.testId || 'N/A').toUpperCase())}</span></td>
                    <td style="font-size: 0.9rem;">
                        <span style="color: var(--accent);">Login:</span> ${r.login || 0}/5 &nbsp;
                        <span style="color: var(--success);">Interface:</span> ${r.interface || 0}/5 &nbsp;
                        <span style="color: var(--warning);">Quality:</span> ${r.quality || 0}/5 &nbsp;
                        <span style="color: #ec4899;">Server:</span> ${r.server || 0}/5
                    </td>
                    <td style="font-style: italic; color: var(--text-secondary);">${sanitizeHTML(f.comment || 'No comment provided')}</td>
                `;
                tbody.appendChild(row);
            });

            const statElement = document.getElementById('statFeedbacks');
            if (statElement) {
                statElement.innerText = feedbacks.length;
            }
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (e) {
        console.error('Load feedbacks error:', e);
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color: var(--danger);'>Failed to load feedbacks: " + (e.message || 'Unknown error') + "</td></tr>";
    }
}

// ===== UPDATE STATS =====
async function updateStats() {
    try {
        const [qRes, sRes, rRes, fRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/admin/all-questions`, { timeout: 10000 }),
            axios.get(`${API_BASE_URL}/api/admin/all-students`, { timeout: 10000 }),
            axios.get(`${API_BASE_URL}/api/admin/results`, { timeout: 10000 }),
            axios.get(`${API_BASE_URL}/api/admin/feedbacks`, { timeout: 10000 })
        ]);

        if (qRes.data && qRes.data.success) {
            const questions = qRes.data.questions || [];
            updateStatElement('statTotal', questions.length);
            updateStatElement('statPhy', questions.filter(q => q.subject === 'Physics').length);
            updateStatElement('statChem', questions.filter(q => q.subject === 'Chemistry').length);
            updateStatElement('statMath', questions.filter(q => q.subject === 'Mathematics').length);
            updateStatElement('statBio', questions.filter(q => q.subject === 'Biology').length);
        }

        if (sRes.data && sRes.data.success) {
            updateStatElement('statStudents', (sRes.data.students || []).length);
        }

        if (rRes.data && rRes.data.success) {
            updateStatElement('statResults', (rRes.data.results || []).length);
        }

        if (fRes.data && fRes.data.success) {
            updateStatElement('statFeedbacks', (fRes.data.feedbacks || []).length);
        }
    } catch (e) {
        console.error('Failed to update stats:', e);
    }
}

function updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = value;
    }
}

// ===== MODAL CONTROLS =====
function closeModal() {
    const modal = document.getElementById('responseModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== UTILITY FUNCTIONS =====
function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // You can replace this with a proper notification system
    const colors = {
        success: '#48bb78',
        error: '#f56565',
        warning: '#ed8936',
        info: '#4299e1'
    };

    console.log(`[${type.toUpperCase()}]:`, message);

    // Simple alert for now - can be replaced with toast notification
    if (type === 'error') {
        alert(message);
    }
}

// ===== INITIALIZATION =====
function initializeAdmin() {
    checkAuth();
    updateStats();
    loadAllQuestions();

    // Update time display
    updateTime();
    setInterval(updateTime, 1000);

    // Close modal when clicking outside
    window.onclick = (event) => {
        const modal = document.getElementById('responseModal');
        if (modal && event.target === modal) {
            closeModal();
        }
    };
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdmin);
} else {
    initializeAdmin();
}

// Export functions for HTML onclick handlers
window.switchTab = switchTab;
window.uploadQuestion = uploadQuestion;
window.previewImage = previewImage;
window.filterQuestions = filterQuestions;
window.filterStudents = filterStudents;
window.deleteQuestion = deleteQuestion;
window.viewStudentDetails = viewStudentDetails;
window.viewResponseSheet = viewResponseSheet;
window.closeModal = closeModal;
window.logout = logout;