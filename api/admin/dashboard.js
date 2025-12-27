/**
 * Admin Dashboard API
 */

const express = require('express');
const router = express.Router();

// GET Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        // TODO: Replace with actual database queries
        const stats = {
            activeTests: 24,
            testsTrend: 12,
            totalStudents: 1250,
            studentsTrend: 8,
            todayExams: 3,
            monthlyRevenue: 240000,
            revenueTrend: 15
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET Performance Data
router.get('/performance', async (req, res) => {
    try {
        const period = req.query.period || '7d';
        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            scores: [65, 72, 68, 75, 78, 82, 85]
        };
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET Upcoming Tests
router.get('/upcoming-tests', async (req, res) => {
    try {
        const tests = [
            { name: 'NEST Mock Test 1', subject: 'Physics', duration: 180, date: '2025-12-28' },
            { name: 'IAT Mock Test 2', subject: 'Mathematics', duration: 120, date: '2025-12-29' },
            { name: 'ISI Mock Test 1', subject: 'Statistics', duration: 150, date: '2025-12-30' }
        ];
        res.json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET Recent Activity
router.get('/recent-activity', async (req, res) => {
    try {
        const activities = [
            { icon: 'user-plus', message: 'New student registered: Rahul Sharma', time: '2 hours ago' },
            { icon: 'file-alt', message: 'Test created: NEST Mock Test 3', time: '5 hours ago' },
            { icon: 'check-circle', message: 'Payment received: ₹2,999 from Priya Patel', time: '1 day ago' }
        ];
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;