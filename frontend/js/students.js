/**
 * Students Management
 */

const mockStudents = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', course: 'NEST', joinDate: '2025-01-15', status: 'Active' },
    { id: 2, name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', course: 'IAT', joinDate: '2025-01-20', status: 'Active' },
    { id: 3, name: 'Amit Kumar', email: 'amit@example.com', phone: '9876543212', course: 'ISI', joinDate: '2025-02-01', status: 'Inactive' }
];

let studentsData = [];

function initStudents() {
    studentsData = mockStudents;
    renderStudentsTable();
    
    document.getElementById('searchStudents')?.addEventListener('input', (e) => {
        renderStudentsTable(e.target.value.toLowerCase());
    });
}

function renderStudentsTable(searchTerm = '') {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;
    
    let filtered = studentsData.filter(s => 
        s.name.toLowerCase().includes(searchTerm) || 
        s.email.toLowerCase().includes(searchTerm) ||
        s.course.toLowerCase().includes(searchTerm)
    );
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">No students found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(s => `
        <tr>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.phone}</td>
            <td><span class="badge badge-primary">${s.course}</span></td>
            <td>${AdminUtils.formatDate(s.joinDate, 'short')}</td>
            <td>
                <span class="status-badge status-${s.status.toLowerCase()}">${s.status}</span>
                <button class="action-btn" onclick="editStudent(${s.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn danger" onclick="deleteStudent(${s.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function editStudent(id) {
    AdminUtils.showToast('Edit student form coming soon!', 'success');
}

function deleteStudent(id) {
    AdminUtils.showConfirmModal(
        'Are you sure you want to delete this student?',
        () => {
            studentsData = studentsData.filter(s => s.id !== id);
            renderStudentsTable();
            AdminUtils.showToast('Student deleted successfully', 'success');
        }
    );
}

// Add Student Form
function initAddStudentForm() {
    document.getElementById('addStudentForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('studentName').value,
            email: document.getElementById('studentEmail').value,
            phone: document.getElementById('studentPhone').value,
            course: document.getElementById('studentCourse').value,
            address: document.getElementById('studentAddress').value
        };
        
        const submitBtn = document.getElementById('submitStudentBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div> Adding Student...';
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        AdminUtils.showToast('Student added successfully!', 'success');
        document.getElementById('addStudentForm').reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Add Student';
    });
}

if (document.getElementById('studentsTableBody')) {
    initStudents();
}

if (document.getElementById('addStudentForm')) {
    initAddStudentForm();
}