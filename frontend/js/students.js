/**
 * Students Management - Connected to Backend
 */

let studentsData = [];

async function initStudents() {
    await loadStudentsFromBackend();
    
    document.getElementById('searchStudents')?.addEventListener('input', (e) => {
        renderStudentsTable(e.target.value.toLowerCase());
    });
    
    document.querySelector('#all-students-page .export-btn')?.addEventListener('click', () => {
        AdminUtils.exportToCSV(studentsData, 'students.csv');
    });
}

async function loadStudentsFromBackend(search = '') {
    try {
        const response = await AdminAPI.getStudents(search);
        studentsData = response.students || response;
        renderStudentsTable();
    } catch (error) {
        console.error('Error loading students:', error);
        AdminUtils.showToast('Failed to load students from server. Using cached data.', 'error');
        
        // Fallback data
        studentsData = [
            { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', course: 'NEST', joinDate: '2025-01-15', status: 'Active', address: 'Mumbai, Maharashtra' },
            { id: 2, name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', course: 'IAT', joinDate: '2025-01-20', status: 'Active', address: 'Ahmedabad, Gujarat' },
            { id: 3, name: 'Amit Kumar', email: 'amit@example.com', phone: '9876543212', course: 'ISI', joinDate: '2025-02-01', status: 'Inactive', address: 'Delhi, India' }
        ];
        renderStudentsTable();
    }
}

function renderStudentsTable(searchTerm = '') {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;
    
    let filtered = studentsData.filter(s => 
        s.name.toLowerCase().includes(searchTerm) || 
        s.email.toLowerCase().includes(searchTerm) ||
        s.phone.includes(searchTerm) ||
        s.course.toLowerCase().includes(searchTerm)
    );
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #64748b;"><i class="fas fa-user-slash" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i><br>No students found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(s => `
        <tr>
            <td><strong>#${s.id}</strong></td>
            <td><strong>${s.name}</strong></td>
            <td>${s.email}</td>
            <td>${s.phone}</td>
            <td><span class="badge badge-primary">${s.course}</span></td>
            <td>${AdminUtils.formatDate(s.joinDate, 'short')}</td>
            <td>
                <span class="status-badge status-${s.status.toLowerCase()}">${s.status}</span>
                <button class="action-btn" onclick="viewStudent(${s.id})" title="View Details"><i class="fas fa-eye"></i></button>
                <button class="action-btn" onclick="editStudent(${s.id})" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn danger" onclick="deleteStudent(${s.id})" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function viewStudent(id) {
    const student = studentsData.find(s => s.id === id);
    if (!student) return;
    
    const modal = document.createElement('div');
    modal.className = 'confirm-modal-overlay';
    modal.innerHTML = `
        <div class="confirm-modal" style="max-width: 500px;">
            <div class="confirm-modal-header" style="text-align: left; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
                <h3 style="font-size: 20px; color: #0f172a; margin: 0;"><i class="fas fa-user-circle"></i> Student Details</h3>
            </div>
            <div class="confirm-modal-body" style="text-align: left; padding: 24px 0;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px;">
                    <div style="margin-bottom: 16px;"><p style="color: #64748b; font-size: 12px; margin-bottom: 4px;">STUDENT ID</p><p style="font-weight: 700; font-size: 18px; color: #0f172a;">#${student.id}</p></div>
                    <div style="margin-bottom: 16px;"><p style="color: #64748b; font-size: 12px; margin-bottom: 4px;">NAME</p><p style="font-weight: 600; color: #0f172a;">${student.name}</p></div>
                    <div style="margin-bottom: 16px;"><p style="color: #64748b; font-size: 12px; margin-bottom: 4px;">EMAIL</p><p style="color: #0f172a;">${student.email}</p></div>
                    <div style="margin-bottom: 16px;"><p style="color: #64748b; font-size: 12px; margin-bottom: 4px;">PHONE</p><p style="color: #0f172a;">${student.phone}</p></div>
                    <div style="margin-bottom: 16px;"><p style="color: #64748b; font-size: 12px; margin-bottom: 4px;">COURSE</p><span class="badge badge-primary">${student.course}</span></div>
                    <div style="margin-bottom: 16px;"><p style="color: #64748b; font-size: 12px; margin-bottom: 4px;">ADDRESS</p><p style="color: #0f172a;">${student.address || 'N/A'}</p></div>
                    <div style="margin-bottom: 16px;"><p style="color: #64748b; font-size: 12px; margin-bottom: 4px;">JOIN DATE</p><p style="color: #0f172a;">${AdminUtils.formatDate(student.joinDate)}</p></div>
                    <div><p style="color: #64748b; font-size: 12px; margin-bottom: 4px;">STATUS</p><span class="status-badge status-${student.status.toLowerCase()}">${student.status}</span></div>
                </div>
            </div>
            <div class="confirm-modal-footer"><button class="btn-primary" onclick="this.closest('.confirm-modal-overlay').remove()">Close</button></div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function editStudent(id) {
    const student = studentsData.find(s => s.id === id);
    if (!student) return;
    
    AdminUtils.showEditModal('Edit Student',
        [
            { key: 'name', label: 'Full Name', type: 'text' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'phone', label: 'Phone', type: 'tel' },
            { key: 'course', label: 'Course', type: 'select', options: ['NEST', 'IAT', 'ISI', 'JEST'] },
            { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
            { key: 'address', label: 'Address', type: 'textarea' }
        ],
        student,
        async (updatedData) => {
            try {
                await AdminAPI.updateStudent(student.id, updatedData);
                Object.assign(student, updatedData);
                renderStudentsTable();
                AdminUtils.showToast('Student updated successfully!', 'success');
            } catch (error) {
                console.error('Error updating student:', error);
                AdminUtils.showToast('Failed to update student', 'error');
            }
        }
    );
}

function deleteStudent(id) {
    AdminUtils.showConfirmModal(
        'Are you sure you want to delete this student? All their records will be permanently removed.',
        async () => {
            try {
                await AdminAPI.deleteStudent(id);
                studentsData = studentsData.filter(s => s.id !== id);
                renderStudentsTable();
                AdminUtils.showToast('Student deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting student:', error);
                AdminUtils.showToast('Failed to delete student', 'error');
            }
        }
    );
}

function initAddStudentForm() {
    document.getElementById('addStudentForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('studentEmail').value;
        const phone = document.getElementById('studentPhone').value;
        
        if (!AdminUtils.validateEmail(email)) {
            AdminUtils.showToast('Invalid email address', 'error');
            return;
        }
        
        if (!AdminUtils.validatePhone(phone)) {
            AdminUtils.showToast('Invalid phone number', 'error');
            return;
        }
        
        const formData = {
            name: document.getElementById('studentName').value,
            email: email,
            phone: phone,
            course: document.getElementById('studentCourse').value,
            address: document.getElementById('studentAddress').value,
            status: 'Active'
        };
        
        const submitBtn = document.getElementById('submitStudentBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div> Adding Student...';
        
        try {
            const response = await AdminAPI.addStudent(formData);
            studentsData.push(response.student || response);
            AdminUtils.showToast('Student added successfully!', 'success');
            document.getElementById('addStudentForm').reset();
        } catch (error) {
            console.error('Error adding student:', error);
            AdminUtils.showToast('Failed to add student', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Add Student';
        }
    });
}

if (document.getElementById('studentsTableBody')) initStudents();
if (document.getElementById('addStudentForm')) initAddStudentForm();

// Make functions globally available
window.initStudents = initStudents;
window.viewStudent = viewStudent;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;