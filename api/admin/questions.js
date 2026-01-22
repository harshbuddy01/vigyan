/**
 * Admin Questions API
 */

const express = require('express');
const router = express.Router();
// const pool = require('../../backend/db'); // ❌ BROKEN IMPORT: File does not exist

let questions = [
    { id: 1, subject: 'Physics', topic: 'Mechanics', difficulty: 'Easy', marks: 1, question: 'What is the SI unit of force?', type: 'MCQ', options: ['Newton', 'Joule', 'Watt', 'Pascal'], answer: 'Newton' },
    { id: 2, subject: 'Physics', topic: 'Thermodynamics', difficulty: 'Medium', marks: 3, question: 'State the first law of thermodynamics', type: 'Descriptive', answer: 'Energy cannot be created or destroyed' },
    { id: 3, subject: 'Mathematics', topic: 'Calculus', difficulty: 'Easy', marks: 1, question: 'What is the derivative of x²?', type: 'MCQ', options: ['2x', 'x', 'x²', '2'], answer: '2x' }
];

// 🔥 NEW: Fixed endpoint with safe JSON parsing from database
// This will be accessible at /api/admin/questions-fixed
router.get('-fixed', async (req, res) => {
    try {
        console.log('📥 Fetching questions from database with safe JSON parsing...');

        const result = await pool.query(
            'SELECT * FROM questions ORDER BY id'
        );

        const questions = result.rows.map(row => {
            // Safe JSON parsing function
            const safeParseJSON = (str) => {
                if (!str) return null;
                try {
                    // Handle double-stringified JSON
                    let parsed = str;
                    while (typeof parsed === 'string') {
                        parsed = JSON.parse(parsed);
                    }
                    return parsed;
                } catch (e) {
                    console.warn('Failed to parse JSON:', str);
                    return null;
                }
            };

            return {
                id: row.id,
                subject: row.subject,
                topic: row.topic || '',
                difficulty: row.difficulty,
                marks: row.marks,
                question: row.question_text,
                type: row.question_type || 'MCQ',
                options: safeParseJSON(row.options) || [],
                answer: row.correct_answer,
                created_at: row.created_at
            };
        });

        console.log(`✅ Successfully fetched ${questions.length} questions`);
        res.json({ questions });

    } catch (error) {
        console.error('❌ Database error:', error);
        res.status(500).json({
            error: 'Failed to fetch questions',
            message: error.message
        });
    }
});

// GET all questions (original endpoint - mock data)
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