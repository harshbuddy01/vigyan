import express from 'express';
import PaymentTransaction from '../models/PaymentTransaction.js';

const router = express.Router();

// ==================== GET ALL TRANSACTIONS ====================
// GET /api/admin/transactions?status=captured&search=xyz
router.get('/transactions', async (req, res) => {
    try {
        const { status, search = '', page = 1, limit = 50 } = req.query;
        
        console.log(`💳 [TRANSACTIONS] Fetching transactions... Status: "${status || 'all'}" Search: "${search}"`);
        
        let query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { razorpayOrderId: { $regex: search, $options: 'i' } },
                { razorpayPaymentId: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const transactions = await PaymentTransaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const totalCount = await PaymentTransaction.countDocuments(query);
        
        // Calculate statistics
        const totalRevenue = await PaymentTransaction.aggregate([
            { $match: { status: 'captured' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const pendingAmount = await PaymentTransaction.aggregate([
            { $match: { status: 'created' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        console.log(`✅ [TRANSACTIONS] Found ${transactions.length} transactions`);
        
        res.json({
            success: true,
            transactions: transactions.map(t => ({
                id: t._id,
                orderId: t.orderId,
                razorpayOrderId: t.razorpayOrderId,
                razorpayPaymentId: t.razorpayPaymentId,
                amount: t.amount / 100, // Convert paise to rupees
                currency: t.currency,
                status: t.status,
                createdAt: t.createdAt,
                paidAt: t.paidAt
            })),
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / parseInt(limit))
            },
            stats: {
                totalRevenue: (totalRevenue[0]?.total || 0) / 100,
                pendingAmount: (pendingAmount[0]?.total || 0) / 100,
                totalTransactions: totalCount
            }
        });
    } catch (error) {
        console.error('❌ [TRANSACTIONS] Error fetching transactions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== GET SINGLE TRANSACTION ====================
// GET /api/admin/transactions/:id
router.get('/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`💳 [TRANSACTIONS] Fetching transaction: ${id}`);
        
        const transaction = await PaymentTransaction.findById(id);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            transaction: {
                id: transaction._id,
                orderId: transaction.orderId,
                razorpayOrderId: transaction.razorpayOrderId,
                razorpayPaymentId: transaction.razorpayPaymentId,
                amount: transaction.amount / 100,
                currency: transaction.currency,
                status: transaction.status,
                createdAt: transaction.createdAt,
                paidAt: transaction.paidAt
            }
        });
    } catch (error) {
        console.error('❌ [TRANSACTIONS] Error fetching transaction:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== GET TRANSACTION STATS ====================
// GET /api/admin/transactions/stats/overview
router.get('/transactions/stats/overview', async (req, res) => {
    try {
        console.log('📊 [TRANSACTIONS] Fetching transaction statistics...');
        
        // Total revenue (captured payments)
        const revenueData = await PaymentTransaction.aggregate([
            { $match: { status: 'captured' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        
        // Pending payments
        const pendingData = await PaymentTransaction.aggregate([
            { $match: { status: 'created' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        
        // Failed payments
        const failedData = await PaymentTransaction.aggregate([
            { $match: { status: 'failed' } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);
        
        // Today's revenue
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        
        const todayRevenue = await PaymentTransaction.aggregate([
            { 
                $match: { 
                    status: 'captured',
                    paidAt: { $gte: startOfToday }
                } 
            },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        
        res.json({
            success: true,
            stats: {
                totalRevenue: (revenueData[0]?.total || 0) / 100,
                totalSuccessful: revenueData[0]?.count || 0,
                pendingAmount: (pendingData[0]?.total || 0) / 100,
                pendingCount: pendingData[0]?.count || 0,
                failedCount: failedData[0]?.count || 0,
                todayRevenue: (todayRevenue[0]?.total || 0) / 100,
                todayCount: todayRevenue[0]?.count || 0
            }
        });
    } catch (error) {
        console.error('❌ [TRANSACTIONS] Error fetching stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== GET DAILY REVENUE CHART DATA ====================
// GET /api/admin/transactions/stats/daily?days=7
router.get('/transactions/stats/daily', async (req, res) => {
    try {
        const { days = 7 } = req.query;
        
        console.log(`📈 [TRANSACTIONS] Fetching daily revenue for ${days} days...`);
        
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(days));
        daysAgo.setHours(0, 0, 0, 0);
        
        const dailyRevenue = await PaymentTransaction.aggregate([
            {
                $match: {
                    status: 'captured',
                    paidAt: { $gte: daysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$paidAt' }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        const chartData = dailyRevenue.map(d => ({
            date: d._id,
            revenue: d.revenue / 100,
            transactions: d.count
        }));
        
        res.json({
            success: true,
            data: chartData,
            period: `${days} days`
        });
    } catch (error) {
        console.error('❌ [TRANSACTIONS] Error fetching daily stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

console.log('✅ Transaction routes loaded');

export default router;