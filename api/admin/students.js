/**
 * Admin Students API
 */

const express = require('express');
const router = express.Router();

// In-memory storage (replace with actual database)
let students = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', course: 'NEST', joinDate: '2025-01-15', status: 'Active', address: 'Mumbai, Maharashtra' },
    { id: 2, name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', course: 'IAT', joinDate: '2025-01-20', status: 'Active', address: 'Ahmedabad, Gujarat' },
    { id: 3, name: 'Amit Kumar', email: 'amit@example.com', phone: '9876543212', course: 'ISI', joinDate: '2025-02-01', status: 'Inactive', address: 'Delhi, India' }
];

// GET all students
router.get('/', (req, res) => {
    try {
        const search = req.query.search || '';
        let filtered = students;
        
        if (search) {
            filtered = students.filter(s => 
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.email.toLowerCase().includes(search.toLowerCase()) ||
                s.phone.includes(search)
            );
        }
        
        res.json({ students: filtered });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single student
router.get('/:id', (req, res) => {
    try {
        const student = students.find(s => s.id === parseInt(req.params.id));
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create student
router.post('/', (req, res) => {
    try {
        const newStudent = {
            id: students.length + 1,
            ...req.body,
            joinDate: new Date().toISOString().split('T')[0],
            status: 'Active'
        };
        students.push(newStudent);
        res.status(201).json({ student: newStudent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update student
router.put('/:id', (req, res) => {
    try {
        const index = students.findIndex(s => s.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Student not found' });
        }
        students[index] = { ...students[index], ...req.body };
        res.json({ student: students[index] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE student
router.delete('/:id', (req, res) => {
    try {
        const index = students.findIndex(s => s.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Student not found' });
        }
        students.splice(index, 1);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;