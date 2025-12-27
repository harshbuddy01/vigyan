/**
 * Admin Tests API
 */

const express = require('express');
const router = express.Router();

let tests = [];

// GET all tests
router.get('/', (req, res) => {
    try {
        res.json({ tests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single test
router.get('/:id', (req, res) => {
    try {
        const test = tests.find(t => t.id === parseInt(req.params.id));
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }
        res.json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create test
router.post('/', (req, res) => {
    try {
        const newTest = {
            id: tests.length + 1,
            ...req.body,
            createdAt: new Date().toISOString()
        };
        tests.push(newTest);
        res.status(201).json({ test: newTest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update test
router.put('/:id', (req, res) => {
    try {
        const index = tests.findIndex(t => t.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Test not found' });
        }
        tests[index] = { ...tests[index], ...req.body };
        res.json({ test: tests[index] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE test
router.delete('/:id', (req, res) => {
    try {
        const index = tests.findIndex(t => t.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Test not found' });
        }
        tests.splice(index, 1);
        res.json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;