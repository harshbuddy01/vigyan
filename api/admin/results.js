/**
 * Admin Results API
 */

const express = require('express');
const router = express.Router();

let results = [
    { id: 1, test: 'NEST Mock 1', testDate: '2025-12-20', student: 'Rahul Sharma', email: 'rahul@example.com', score: 85, total: 100, rank: 12, percentile: 92.5, timeTaken: 165 },
    { id: 2, test: 'NEST Mock 1', testDate: '2025-12-20', student: 'Priya Patel', email: 'priya@example.com', score: 92, total: 100, rank: 5, percentile: 98.2, timeTaken: 170 },
    { id: 3, test: 'IAT Mock 2', testDate: '2025-12-22', student: 'Amit Kumar', email: 'amit@example.com', score: 78, total: 100, rank: 25, percentile: 85.3, timeTaken: 180 }
];

// GET all results
router.get('/', (req, res) => {
    try {
        res.json({ results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single result
router.get('/:id', (req, res) => {
    try {
        const result = results.find(r => r.id === parseInt(req.params.id));
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;