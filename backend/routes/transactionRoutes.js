import express from 'express';
import { PaymentTransaction } from '../models/PaymentTransaction.js'; // ✅ FIXED: Named import

const router = express.Router();

// ==================== GET ALL TRANSACTIONS ====================
router.get('/', async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (search) {
            query.email = { $regex: search, $options: 'i' };
        }

        const transactions = await PaymentTransaction.find(query)
            .sort({ created_at: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await PaymentTransaction.countDocuments(query);

        res.json({
            success: true,
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== GET SINGLE TRANSACTION ====================
router.get('/:id', async (req, res) => {
    try {
        const transaction = await PaymentTransaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ 
                success: false, 
                error: 'Transaction not found' 
            });
        }

        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== TRANSACTION STATISTICS ====================
router.get('/stats/overview', async (req, res) => {
    try {
        const [stats] = await PaymentTransaction.aggregate([
            {
                $facet: {
                    totalRevenue: [
                        { $match: { status: 'paid' } },
                        { $group: { _id: null, total: { $sum: '$amount' } } }
                    ],
                    totalTransactions: [
                        { $count: 'count' }
                    ],
                    statusBreakdown: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalRevenue: stats.totalRevenue[0]?.total || 0,
                totalTransactions: stats.totalTransactions[0]?.count || 0,
                statusBreakdown: stats.statusBreakdown
            }
        });
    } catch (error) {
        console.error('Transaction stats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== DAILY REVENUE ====================
router.get('/stats/daily', async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const dailyRevenue = await PaymentTransaction.aggregate([
            { 
                $match: { 
                    status: 'paid',
                    created_at: { $gte: startDate }
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: dailyRevenue.map(item => ({
                date: item._id,
                revenue: item.revenue,
                transactions: item.count
            }))
        });
    } catch (error) {
        console.error('Daily revenue error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
