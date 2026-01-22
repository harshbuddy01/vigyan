// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:8080"
    : "https://iin-production.up.railway.app"; // TODO: Update this URL after migrating to Hostinger

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
    document.getElementById('currentTime').innerText = now.toLocaleTimeString();
    document.getElementById('currentDate').innerText = now.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabName === 'manage') loadAllQuestions();
    if (tabName === 'students') loadStudents();
    if (tabName === 'results') loadResults();
    if (tabName === 'feedbacks') loadFeedbacks();
}

// ===== IMAGE PREVIEW =====
function previewImage() {
    const file = document.getElementById("qImage").files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
        base64Image = reader.result;
        document.getElementById("imgPreview").src = base64Image;
        document.getElementById("previewContainer").classList.add('show');
    };
    reader.readAsDataURL(file);
}

// ===== UPLOAD QUESTION =====
async function uploadQuestion() {
    const data = {
        testId: document.getElementById("testId").value,
        subject: document.getElementById("subject").value,
        questionText: document.getElementById("questionText").value,
        image: base64Image,
        options: [
            document.getElementById("opt1").value,
            document.getElementById("opt2").value,
            document.getElementById("opt3").value,
            document.getElementById("opt4").value
        ],
        correctAnswer: document.getElementById("correctAnswer").value
    };

    try {
        const res = await axios.post(`${API_BASE_URL}/api/upload-question`, data);
        if (res.data.success) {
            alert("✅ Question successfully deployed to database!");
            resetForm();
            loadAllQuestions();
            updateStats();
        }
    } catch (e) {
        alert("❌ Upload failed: " + (e.response?.data?.message || e.message));
    }
}

function resetForm() {
    document.getElementById("questionText").value = "";
    document.getElementById("correctAnswer").value = "";
    ['opt1', 'opt2', 'opt3', 'opt4'].forEach(id => document.getElementById(id).value = "");
    document.getElementById("qImage").value = "";
    document.getElementById("previewContainer").classList.remove('show');
    base64Image = "";
}

// ===== LOAD QUESTIONS =====
async function loadAllQuestions() {
    const tbody = document.getElementById("questionsTable");
    tbody.innerHTML = "<tr><td colspan='5' class='loading'><div class='spinner'></div>Loading...</td></tr>";

    try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/all-questions`);
        if (res.data.success) {
            const questions = res.data.questions;
            tbody.innerHTML = "";

            if (questions.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:40px;'>No questions found</td></tr>";
                return;
            }

            questions.forEach(q => {
                const badgeClass = q.subject === "Physics" ? "badge-phys" :
                    q.subject === "Chemistry" ? "badge-chem" :
                        q.subject === "Mathematics" ? "badge-math" : "badge-bio";

                tbody.innerHTML += `
                    <tr>
                        <td><span class="badge ${badgeClass}">${q.subject}</span></td>
                        <td style="font-size: 0.9rem;">${q.questionText.substring(0, 100)}${q.questionText.length > 100 ? '...' : ''}</td>
                        <td>${q.image ? `<img src="${q.image}" class="table-img" onclick="window.open(this.src)">` : '-'}</td>
                        <td style="color: var(--success); font-weight: 600;">${q.correctAnswer.substring(0, 30)}${q.correctAnswer.length > 30 ? '...' : ''}</td>
                        <td>
                            <button class="action-btn btn-delete" onclick="deleteQuestion('${q._id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            updateStats();
            if (window.MathJax) MathJax.typeset();
        }
    } catch (e) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color: var(--danger);'>Failed to load questions</td></tr>";
    }
}

async function deleteQuestion(id) {
    if (!confirm("Are you sure you want to delete this question permanently?")) return;

    try {
        await axios.delete(`${API_BASE_URL}/api/admin/delete-question/${id}`);
        alert("✅ Question deleted successfully");
        loadAllQuestions();
    } catch (e) {
        alert("❌ Failed to delete question");
    }
}

function filterQuestions() {
    const searchTerm = document.getElementById('searchQuestions').value.toLowerCase();
    const rows = document.querySelectorAll('#questionsTable tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// ===== LOAD STUDENTS =====
async function loadStudents() {
    const tbody = document.getElementById("studentsTable");
    tbody.innerHTML = "<tr><td colspan='5' class='loading'><div class='spinner'></div>Loading...</td></tr>";

    try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/all-students`);
        if (res.data.success) {
            const students = res.data.students;
            tbody.innerHTML = "";

            if (students.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:40px;'>No students found</td></tr>";
                return;
            }

            students.forEach(s => {
                const tests = s.purchasedTests && s.purchasedTests.length > 0
                    ? s.purchasedTests.map(t => `<span class="badge" style="margin:2px;">${t.toUpperCase()}</span>`).join(' ')
                    : '<span style="color: var(--text-secondary);">None</span>';

                tbody.innerHTML += `
                    <tr>
                        <td style="color: var(--warning); font-weight: 700;">${s.rollNumber || 'N/A'}</td>
                        <td>${s.email}</td>
                        <td>${tests}</td>
                        <td style="font-size: 0.85rem;">${new Date(s.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td>
                            <button class="action-btn" style="color: var(--accent);" onclick="viewStudentDetails('${s._id}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            document.getElementById('statStudents').innerText = students.length;
        }
    } catch (e) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color: var(--danger);'>Failed to load students</td></tr>";
    }
}

function filterStudents() {
    const searchTerm = document.getElementById('searchStudents').value.toLowerCase();
    const rows = document.querySelectorAll('#studentsTable tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function viewStudentDetails(id) {
    alert('Student details view - Feature coming soon!');
}

// ===== LOAD RESULTS =====
async function loadResults() {
    const tbody = document.getElementById("resultsTable");
    tbody.innerHTML = "<tr><td colspan='5' class='loading'><div class='spinner'></div>Loading...</td></tr>";

    try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/results`);
        if (res.data.success) {
            const { results, questions } = res.data;
            cachedResultsData = { results, questions };
            tbody.innerHTML = "";

            if (results.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:40px;'>No results found</td></tr>";
                return;
            }

            results.forEach((r, idx) => {
                tbody.innerHTML += `
                    <tr>
                        <td style="color: var(--warning); font-weight: 700;">${r.rollNumber || 'N/A'}</td>
                        <td>${r.email}</td>
                        <td><span class="badge">${r.testId.toUpperCase()}</span></td>
                        <td style="font-size: 0.85rem;">${new Date(r.submissionTime).toLocaleString()}</td>
                        <td>
                            <button class="btn-view" onclick="viewResponseSheet(${idx})">
                                <i class="fas fa-file-alt"></i>
                                View Response
                            </button>
                        </td>
                    </tr>
                `;
            });

            document.getElementById('statResults').innerText = results.length;
        }
    } catch (e) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color: var(--danger);'>Failed to load results</td></tr>";
    }
}

function viewResponseSheet(idx) {
    const r = cachedResultsData.results[idx];
    const testQs = cachedResultsData.questions.filter(q => q.testId === r.testId);

    let organized = [];
    ["Physics", "Chemistry", "Mathematics", "Biology"].forEach(subject => {
        organized = organized.concat(testQs.filter(q => q.subject === subject));
    });

    let html = `
        <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="color: var(--accent); margin-bottom: 10px;">Student Information</h3>
            <p><strong>Email:</strong> ${r.email}</p>
            <p><strong>Roll Number:</strong> ${r.rollNumber || 'N/A'}</p>
            <p><strong>Test:</strong> ${r.testId.toUpperCase()}</p>
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

        const userAnswerIndex = r.answers[key];
        const userAnswer = userAnswerIndex !== undefined ? q.options[userAnswerIndex] : "SKIPPED";
        const isCorrect = userAnswer === q.correctAnswer;
        const points = userAnswer === "SKIPPED" ? 0 : isCorrect ? 4 : -1;
        totalScore += points;

        const statusColor = userAnswer === "SKIPPED" ? "var(--text-secondary)" : isCorrect ? "var(--success)" : "var(--danger)";
        const statusText = userAnswer === "SKIPPED" ? "0" : isCorrect ? "+4" : "-1";

        html += `
            <tr>
                <td><span class="badge badge-${q.subject.toLowerCase().substring(0, 4)}">${q.subject}</span></td>
                <td style="font-size: 0.85rem;">${q.questionText.substring(0, 80)}...</td>
                <td>${userAnswer.substring(0, 30)}${userAnswer.length > 30 ? '...' : ''}</td>
                <td style="color: var(--success);">${q.correctAnswer.substring(0, 30)}${q.correctAnswer.length > 30 ? '...' : ''}</td>
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

    document.getElementById("modalStudentName").innerHTML = `<i class="fas fa-file-alt"></i> Response Sheet: ${r.email}`;
    document.getElementById("sheetContent").innerHTML = html;
    document.getElementById("responseModal").style.display = "flex";

    if (window.MathJax) MathJax.typeset();
}

// ===== LOAD FEEDBACKS =====
async function loadFeedbacks() {
    const tbody = document.getElementById("feedbackTable");
    tbody.innerHTML = "<tr><td colspan='5' class='loading'><div class='spinner'></div>Loading...</td></tr>";

    try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/feedbacks`);
        if (res.data.success) {
            const feedbacks = res.data.feedbacks;
            tbody.innerHTML = "";

            if (feedbacks.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:40px;'>No feedbacks found</td></tr>";
                return;
            }

            feedbacks.forEach(f => {
                const r = f.ratings || {};
                tbody.innerHTML += `
                    <tr>
                        <td style="color: var(--warning); font-weight: 700;">${f.rollNumber || 'N/A'}</td>
                        <td>${f.email}<br><small style="color: var(--text-secondary);">${(f.testId || '').toUpperCase()}</small></td>
                        <td><span class="badge">${(f.testId || 'N/A').toUpperCase()}</span></td>
                        <td style="font-size: 0.9rem;">
                            <span style="color: var(--accent);">Login:</span> ${r.login || 0}/5 &nbsp;
                            <span style="color: var(--success);">Interface:</span> ${r.interface || 0}/5 &nbsp;
                            <span style="color: var(--warning);">Quality:</span> ${r.quality || 0}/5 &nbsp;
                            <span style="color: #ec4899;">Server:</span> ${r.server || 0}/5
                        </td>
                        <td style="font-style: italic; color: var(--text-secondary);">${f.comment || 'No comment provided'}</td>
                    </tr>
                `;
            });

            document.getElementById('statFeedbacks').innerText = feedbacks.length;
        }
    } catch (e) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color: var(--danger);'>Failed to load feedbacks</td></tr>";
    }
}

// ===== UPDATE STATS =====
async function updateStats() {
    try {
        const [qRes, sRes, rRes, fRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/admin/all-questions`),
            axios.get(`${API_BASE_URL}/api/admin/all-students`),
            axios.get(`${API_BASE_URL}/api/admin/results`),
            axios.get(`${API_BASE_URL}/api/admin/feedbacks`)
        ]);

        if (qRes.data.success) {
            const questions = qRes.data.questions;
            document.getElementById('statTotal').innerText = questions.length;
            document.getElementById('statPhy').innerText = questions.filter(q => q.subject === 'Physics').length;
            document.getElementById('statChem').innerText = questions.filter(q => q.subject === 'Chemistry').length;
            document.getElementById('statMath').innerText = questions.filter(q => q.subject === 'Mathematics').length;
            document.getElementById('statBio').innerText = questions.filter(q => q.subject === 'Biology').length;
        }

        if (sRes.data.success) {
            document.getElementById('statStudents').innerText = sRes.data.students.length;
        }

        if (rRes.data.success) {
            document.getElementById('statResults').innerText = rRes.data.results.length;
        }

        if (fRes.data.success) {
            document.getElementById('statFeedbacks').innerText = fRes.data.feedbacks.length;
        }
    } catch (e) {
        console.error('Failed to update stats:', e);
    }
}

// ===== MODAL CONTROLS =====
function closeModal() {
    document.getElementById('responseModal').style.display = 'none';
}

// ===== INITIALIZATION =====
function initializeAdmin() {
    checkAuth();
    updateStats();
    loadAllQuestions();
    setInterval(updateTime, 1000);
    updateTime();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdmin);
} else {
    initializeAdmin();
}