/**
 * Students Management Module - REAL DATA ONLY
 */

let allStudents = [];
let currentEditId = null;

function initStudents() {
    console.log('👥 Initializing Students page...');
    renderStudentsPage();
    loadStudents();
}

function initAddStudent() {
    console.log('➕ Initializing Add Student page...');
    renderAddStudentPage();
}

function renderStudentsPage() {
    const container = document.getElementById('all-students-page');
    if (!container) return;
    
    container.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-users"></i> All Students</h1>
            <p style="color: #64748b; margin-top: 8px;">Manage student records</p>
        </div>
        
        <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: center;">
            <input type="text" id="studentSearch" placeholder="Search students..." 
                   style="flex: 1; padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
            <button class="btn-primary" onclick="loadStudents()">
                <i class="fas fa-sync"></i> Refresh
            </button>
            <button class="btn-primary" onclick="document.querySelector('[data-page=\"add-student\"]').click()">
                <i class="fas fa-user-plus"></i> Add Student
            </button>
        </div>
        
        <div class="card" style="overflow-x: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>NAME</th>
                        <th>EMAIL</th>
                        <th>PHONE</th>
                        <th>COURSE</th>
                        <th>JOIN DATE</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody id="studentsTableBody">
                    <tr><td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i><br>
                        Loading students from database...
                    </td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('studentSearch').addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        filterStudents(search);
    });
}

async function loadStudents() {
    try {
        console.log('🔄 Fetching students from backend...');
        const response = await fetch('/api/admin/students');
        const data = await response.json();
        
        allStudents = data.students || [];
        console.log(`✅ Loaded ${allStudents.length} real students from database`);
        displayStudents(allStudents);
    } catch (error) {
        console.error('❌ Failed to load students:', error);
        document.getElementById('studentsTableBody').innerHTML = `
            <tr><td colspan="8" style="text-align: center; padding: 40px; color: #ef4444;">
                <i class="fas fa-exclamation-circle" style="font-size: 24px;"></i><br>
                Failed to load students. Check backend connection.
            </td></tr>
        `;
    }
}

function filterStudents(search) {
    const filtered = allStudents.filter(s => 
        s.name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.phone.includes(search) ||
        s.course.toLowerCase().includes(search)
    );
    displayStudents(filtered);
}

function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;
    
    if (students.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
                <i class="fas fa-user-slash" style="font-size: 24px;"></i><br>
                No students registered yet
            </td></tr>
        `;
        return;
    }
    
    tbody.innerHTML = students.map(student => `
        <tr>
            <td><strong>#${student.id}</strong></td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td><span class="badge badge-${student.course.toLowerCase()}">${student.course}</span></td>
            <td>${student.joinDate}</td>
            <td><span class="status-active">${student.status}</span></td>
            <td>
                <button class="action-btn" onclick="viewStudent(${student.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" onclick="editStudent(${student.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn danger" onclick="deleteStudent(${student.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function viewStudent(id) {
    const student = allStudents.find(s => s.id === id);
    if (!student) return;
    
    alert(`Student Details:\n\nName: ${student.name}\nEmail: ${student.email}\nPhone: ${student.phone}\nCourse: ${student.course}\nJoin Date: ${student.joinDate}\nStatus: ${student.status}`);
}

function editStudent(id) {
    const student = allStudents.find(s => s.id === id);
    if (!student) return;
    
    currentEditId = id;
    const name = prompt('Student Name:', student.name);
    if (!name) return;
    
    const email = prompt('Email:', student.email);
    if (!email) return;
    
    const phone = prompt('Phone:', student.phone);
    if (!phone) return;
    
    const course = prompt('Course (IAT/NEST/ISI):', student.course);
    if (!course) return;
    
    updateStudent(id, {name, email, phone, course, status: student.status});
}

async function updateStudent(id, data) {
    try {
        console.log(`✏️ Updating student #${id}...`);
        const response = await fetch(`/api/admin/students/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('✅ Student updated successfully');
            if (window.AdminUtils) window.AdminUtils.showToast('Student updated successfully', 'success');
            loadStudents();
        } else {
            throw new Error('Update failed');
        }
    } catch (error) {
        console.error('❌ Update error:', error);
        alert('Failed to update student. Please try again.');
    }
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
        console.log(`🗑️ Deleting student #${id}...`);
        const response = await fetch(`/api/admin/students/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log('✅ Student deleted successfully');
            if (window.AdminUtils) window.AdminUtils.showToast('Student deleted successfully', 'success');
            loadStudents();
        } else {
            throw new Error('Delete failed');
        }
    } catch (error) {
        console.error('❌ Delete error:', error);
        alert('Failed to delete student. Please try again.');
    }
}

function renderAddStudentPage() {
    const container = document.getElementById('add-student-page');
    if (!container) return;
    
    container.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-user-plus"></i> Add New Student</h1>
            <p style="color: #64748b; margin-top: 8px;">Register a new student in the system</p>
        </div>
        
        <div class="card" style="max-width: 700px;">
            <form id="addStudentForm" onsubmit="handleAddStudent(event)">
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" required placeholder="Enter student name">
                </div>
                
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" required placeholder="student@example.com">
                </div>
                
                <div class="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" name="phone" required placeholder="10-digit phone number" pattern="[0-9]{10}">
                </div>
                
                <div class="form-group">
                    <label>Course *</label>
                    <select name="course" required>
                        <option value="">Select Course</option>
                        <option value="IAT">IAT (Indian Institute of Science)</option>
                        <option value="NEST">NEST (National Entrance Screening Test)</option>
                        <option value="ISI">ISI (Indian Statistical Institute)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Address</label>
                    <textarea name="address" rows="3" placeholder="Enter address (optional)"></textarea>
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i> Add Student
                    </button>
                    <button type="button" class="btn-secondary" onclick="document.querySelector('[data-page=\"all-students\"]').click()">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
}

async function handleAddStudent(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const studentData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        course: formData.get('course'),
        address: formData.get('address') || 'India'
    };
    
    try {
        console.log('➕ Adding new student...');
        const response = await fetch('/api/admin/students', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(studentData)
        });
        
        if (response.ok) {
            console.log('✅ Student added successfully');
            if (window.AdminUtils) window.AdminUtils.showToast('Student added successfully!', 'success');
            event.target.reset();
            setTimeout(() => {
                document.querySelector('[data-page="all-students"]').click();
            }, 1000);
        } else {
            throw new Error('Failed to add student');
        }
    } catch (error) {
        console.error('❌ Add student error:', error);
        alert('Failed to add student. Please try again.');
    }
}

window.initStudents = initStudents;
window.initAddStudent = initAddStudent;
window.viewStudent = viewStudent;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.handleAddStudent = handleAddStudent;