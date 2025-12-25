// API Configuration
const API_BASE_URL = "https://iin-production.up.railway.app";

// Global variables
let base64Image = "";
let cachedResultsData = [];
let authCheckDone = false;

// ===== AUTHENTICATION =====
function checkAuth() {
    // Prevent multiple auth checks
    if (authCheckDone) return;
    authCheckDone = true;
    
    const adminKey = localStorage.getItem("adminKey");
    if (adminKey !== "secret_unlocked") {
        // Prevent reload loop by checking current page
        if (!window.location.href.includes('adminlogin.html')) {
            window.location.replace("adminlogin.html");
        }
    }
}

function logout() {
    if(confirm('Are you sure you want to logout?')) {
        localStorage.removeItem("adminKey");
        authCheckDone = false;
        window.location.replace("adminlogin.html");
    }
}

// ===== TIME DISPLAY =====
function updateTime() {
    const timeEl = document.getElementById('currentTime');
    const dateEl = document.getElementById('currentDate');
    
    if (!timeEl || !dateEl) return;
    
    const now = new Date();
    timeEl.innerText = now.toLocaleTimeString();
    dateEl.innerText = now.toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
}

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const tabElement = document.getElementById(`tab-${tabName}`);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    if(tabName === 'manage') loadAllQuestions();
    if(tabName === 'students') loadStudents();
    if(tabName === 'results') loadResults();
    if(tabName === 'feedbacks') loadFeedbacks();
    if(tabName === 'overview') updateStats();
}

// ===== IMAGE PREVIEW =====
function previewImage() {
    const file = document.getElementById("qImage").files[0];
    if(!file) return;
    
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
    const questionText = document.getElementById("questionText").value;
    const correctAnswer = document.getElementById("correctAnswer").value;
    const opt1 = document.getElementById("opt1").value;
    const opt2 = document.getElementById("opt2").value;
    const opt3 = document.getElementById("opt3").value;
    const opt4 = document.getElementById("opt4").value;
    
    if (!questionText || !correctAnswer || !opt1 || !opt2 || !opt3 || !opt4) {
        alert("⚠️ Please fill all required fields!");
        return;
    }
    
    const data = {
        testId: document.getElementById("testId").value,
        subject: document.getElementById("subject").value,
        questionText: questionText,
        image: base64Image,
        options: [opt1, opt2, opt3, opt4],
        correctAnswer: correctAnswer
    };

    try {
        console.log('Uploading question...', data);
        const res = await axios.post(`${API_BASE_URL}/api/upload-question`, data);
        console.log('Upload response:', res.data);
        
        if(res.data.success) {
            alert("✅ Question successfully deployed to database!");
            resetForm();
            
            // Refresh stats and questions immediately
            await updateStats();
            await loadAllQuestions();
        }
    } catch (e) {
        console.error('Upload error:', e);
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
    if (!tbody) {
        console.error('Questions table not found');
        return;
    }
    
    tbody.innerHTML = "<tr><td colspan='5' class='loading'><div class='spinner'></div>Loading...</td></tr>";
    
    try {
        console.log('Loading questions from:', `${API_BASE_URL}/api/admin/all-questions`);
        const res = await axios.get(`${API_BASE_URL}/api/admin/all-questions`);
        console.log('Questions response:', res.data);
        
        if(res.data.success) {
            const questions = res.data.questions;
            tbody.innerHTML = "";
            
            if(questions.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:40px; color: var(--text-secondary);'>No questions found. Upload your first question!</td></tr>";
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
            
            // Update stats after loading questions
            await updateStats();
            
            if(window.MathJax) MathJax.typeset();
        } else {
            tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:40px; color: var(--danger);'>" + (res.data.message || 'Failed to load questions') + "</td></tr>";
        }
    } catch(e) {
        console.error('Error loading questions:', e);
        tbody.innerHTML = `<tr><td colspan='5' style='text-align:center; color: var(--danger); padding:40px;'>Failed to load questions<br><small>${e.message}</small></td></tr>`;
    }
}

async function deleteQuestion(id) {
    if(!confirm("Are you sure you want to delete this question permanently?")) return;
    
    try {
        await axios.delete(`${API_BASE_URL}/api/admin/delete-question/${id}`);
        alert("✅ Question deleted successfully");
        await loadAllQuestions();
        await updateStats();
    } catch(e) {
        console.error('Delete error:', e);
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
    if (!tbody) return;
    
    tbody.innerHTML = "<tr><td colspan='5' class='loading'><div class='spinner'></div>Loading...</td></tr>";
    
    try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/all-students`);
        if(res.data.success) {
            const students = res.data.students;
            tbody.innerHTML = "";
            
            if(students.length === 0) {
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
                            <button class="action-btn" style="color: var(--danger);" onclick="deleteStudent('${s.email}')" title="Delete Student">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            const statEl = document.getElementById('statStudents');
            if (statEl) statEl.innerText = students.length;
        }
    } catch(e) {
        console.error('Error loading students:', e);
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color: var(--danger);'>Failed to load students</td></tr>";
    }
}

/**
 * Delete a student by email
 */
async function deleteStudent(email) {
    if(!confirm(`⚠️ Are you sure you want to delete this student?\n\nEmail: ${email}\n\nThis will delete ALL records for this student and CANNOT be undone!`)) {
        return;
    }
    
    try {
        const res = await axios.delete(`${API_BASE_URL}/api/admin/students/email/${email}`);
        
        if(res.data.success) {
            alert(`✅ Success!\n\nDeleted ${res.data.deletedCount} record(s) for ${email}`);
            await loadStudents();
            await updateStats();
        } else {
            alert('❌ Error: ' + res.data.message);
        }
    } catch(e) {
        console.error('Delete student error:', e);
        alert('❌ Failed to delete student: ' + (e.response?.data?.message || e.message));
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
    if (!tbody) return;
    
    tbody.innerHTML = "<tr><td colspan='5' class='loading'><div class='spinner'></div>Loading...</td></tr>";
    
    try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/results`);
        if(res.data.success) {
            const { results, questions } = res.data;
            cachedResultsData = { results, questions };
            tbody.innerHTML = "";
            
            if(results.length === 0) {
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
            
            const statEl = document.getElementById('statResults');
            if (statEl) statEl.innerText = results.length;
        }
    } catch(e) {
        console.error('Error loading results:', e);
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
                <td><span class="badge badge-${q.subject.toLowerCase().substring(0,4)}">${q.subject}</span></td>
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
    
    if(window.MathJax) MathJax.typeset();
}

// ===== LOAD FEEDBACKS =====
async function loadFeedbacks() {
    const tbody = document.getElementById("feedbackTable");
    if (!tbody) return;
    
    tbody.innerHTML = "<tr><td colspan='5' class='loading'><div class='spinner'></div>Loading...</td></tr>";
    
    try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/feedbacks`);
        if(res.data.success) {
            const feedbacks = res.data.feedbacks;
            tbody.innerHTML = "";
            
            if(feedbacks.length === 0) {
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
            
            const statEl = document.getElementById('statFeedbacks');
            if (statEl) statEl.innerText = feedbacks.length;
        }
    } catch(e) {
        console.error('Error loading feedbacks:', e);
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color: var(--danger);'>Failed to load feedbacks</td></tr>";
    }
}

// ===== UPDATE STATS =====
async function updateStats() {
    console.log('Updating statistics...');
    try {
        const [qRes, sRes, rRes, fRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/admin/all-questions`),
            axios.get(`${API_BASE_URL}/api/admin/all-students`),
            axios.get(`${API_BASE_URL}/api/admin/results`),
            axios.get(`${API_BASE_URL}/api/admin/feedbacks`)
        ]);
        
        console.log('Stats data received:', {
            questions: qRes.data.questions?.length || 0,
            students: sRes.data.students?.length || 0,
            results: rRes.data.results?.length || 0,
            feedbacks: fRes.data.feedbacks?.length || 0
        });
        
        if(qRes.data.success && qRes.data.questions) {
            const questions = qRes.data.questions;
            const setStatSafe = (id, value) => {
                const el = document.getElementById(id);
                if (el) {
                    el.innerText = value;
                    console.log(`Updated ${id} to ${value}`);
                } else {
                    console.warn(`Element ${id} not found`);
                }
            };
            
            setStatSafe('statTotal', questions.length);
            setStatSafe('statPhy', questions.filter(q => q.subject === 'Physics').length);
            setStatSafe('statChem', questions.filter(q => q.subject === 'Chemistry').length);
            setStatSafe('statMath', questions.filter(q => q.subject === 'Mathematics').length);
            setStatSafe('statBio', questions.filter(q => q.subject === 'Biology').length);
        }
        
        if(sRes.data.success && sRes.data.students) {
            const el = document.getElementById('statStudents');
            if (el) el.innerText = sRes.data.students.length;
        }
        
        if(rRes.data.success && rRes.data.results) {
            const el = document.getElementById('statResults');
            if (el) el.innerText = rRes.data.results.length;
        }
        
        if(fRes.data.success && fRes.data.feedbacks) {
            const el = document.getElementById('statFeedbacks');
            if (el) el.innerText = fRes.data.feedbacks.length;
        }
        
        console.log('Statistics updated successfully');
    } catch(e) {
        console.error('Failed to update stats:', e);
    }
}

// ===== MODAL CONTROLS =====
function closeModal() {
    const modal = document.getElementById('responseModal');
    if (modal) modal.style.display = 'none';
}

// ===== INITIALIZATION =====
function initializeAdmin() {
    console.log('Initializing admin panel...');
    checkAuth();
    
    // Wait a bit for DOM to be fully ready
    setTimeout(async () => {
        await updateStats();
        console.log('Initial stats loaded');
    }, 500);
    
    setInterval(updateTime, 1000);
    updateTime();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdmin);
} else {
    initializeAdmin();
}