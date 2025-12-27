/**
 * Admin Transactions API
 */

const express = require('express');
const router = express.Router();

let transactions = [
    { id: 'TXN001', student: 'Rahul Sharma', email: 'rahul@example.com', amount: 2999, date: '2025-12-20', status: 'Success', method: 'UPI', upiId: 'rahul@paytm' },
    { id: 'TXN002', student: 'Priya Patel', email: 'priya@example.com', amount: 2999, date: '2025-12-21', status: 'Success', method: 'Card', cardLast4: '4532' },
    { id: 'TXN003', student: 'Amit Kumar', email: 'amit@example.com', amount: 2999, date: '2025-12-22', status: 'Pending', method: 'UPI', upiId: 'amit@phonepe' }
];

// GET all transactions
router.get('/', (req, res) => {
    try {
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single transaction
router.get('/:id', (req, res) => {
    try {
        const transaction = transactions.find(t => t.id === req.params.id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;