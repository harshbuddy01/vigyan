/**
 * Admin Questions API
 */

const express = require('express');
const router = express.Router();

let questions = [
    { id: 1, subject: 'Physics', topic: 'Mechanics', difficulty: 'Easy', marks: 1, question: 'What is the SI unit of force?', type: 'MCQ', options: ['Newton', 'Joule', 'Watt', 'Pascal'], answer: 'Newton' },
    { id: 2, subject: 'Physics', topic: 'Thermodynamics', difficulty: 'Medium', marks: 3, question: 'State the first law of thermodynamics', type: 'Descriptive', answer: 'Energy cannot be created or destroyed' },
    { id: 3, subject: 'Mathematics', topic: 'Calculus', difficulty: 'Easy', marks: 1, question: 'What is the derivative of x²?', type: 'MCQ', options: ['2x', 'x', 'x²', '2'], answer: '2x' }
];

// GET all questions
router.get('/', (req, res) => {
    try {
        const { subject, difficulty, search } = req.query;
        let filtered = questions;
        
        if (subject && subject !== 'all') {
            filtered = filtered.filter(q => q.subject === subject);
        }
        if (difficulty && difficulty !== 'all') {
            filtered = filtered.filter(q => q.difficulty === difficulty);
        }
        if (search) {
            filtered = filtered.filter(q => 
                q.question.toLowerCase().includes(search.toLowerCase()) ||
                q.topic.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        res.json({ questions: filtered });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single question
router.get('/:id', (req, res) => {
    try {
        const question = questions.find(q => q.id === parseInt(req.params.id));
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create question
router.post('/', (req, res) => {
    try {
        const newQuestion = {
            id: questions.length + 1,
            ...req.body
        };
        questions.push(newQuestion);
        res.status(201).json({ question: newQuestion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update question
router.put('/:id', (req, res) => {
    try {
        const index = questions.findIndex(q => q.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Question not found' });
        }
        questions[index] = { ...questions[index], ...req.body };
        res.json({ question: questions[index] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE question
router.delete('/:id', (req, res) => {
    try {
        const index = questions.findIndex(q => q.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Question not found' });
        }
        questions.splice(index, 1);
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;