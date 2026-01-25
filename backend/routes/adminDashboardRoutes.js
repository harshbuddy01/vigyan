import express from 'express';
import Student from '../models/Student.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import StudentAttempt from '../models/StudentAttempt.js';

const router = express.Router();

// ==================== DASHBOARD STATS ====================
// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
    try {
        console.log('📊 [DASHBOARD] Fetching dashboard statistics...');
        
        const totalStudents = await Student.countDocuments();
        const totalAttempts = await StudentAttempt.countDocuments();
        
        // Calculate total revenue from captured payments
        const revenueData = await PaymentTransaction.aggregate([
            { $match: { status: 'captured' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const totalRevenue = revenueData[0]?.total || 0;
        
        // Placeholder for active tests (to be implemented with Test model)
        const activeTests = 24;
        const todaysExams = 3;
        
        console.log(`✅ [DASHBOARD] Stats: ${totalStudents} students, ₹${totalRevenue/100} revenue`);
        
        res.json({
            success: true,
            stats: {
                totalStudents,
                totalRevenue: totalRevenue / 100, // Convert paise to rupees
                activeTests,
                todaysExams,
                totalAttempts
            }
        });
    } catch (error) {
        console.error('❌ [DASHBOARD] Error fetching stats:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ==================== PERFORMANCE DATA ====================
// GET /api/admin/dashboard/performance?period=7d
router.get('/dashboard/performance', async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        
        console.log(`📈 [DASHBOARD] Fetching performance data for period: ${period}`);
        
        // Placeholder data - implement real chart data later
        const performanceData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Student Performance',
                data: [65, 70, 75, 80, 72, 78, 85]
            }]
        };
        
        res.json({
            success: true,
            period,
            data: performanceData
        });
    } catch (error) {
        console.error('❌ [DASHBOARD] Error fetching performance:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== UPCOMING TESTS ====================
// GET /api/admin/dashboard/upcoming-tests
router.get('/dashboard/upcoming-tests', async (req, res) => {
    try {
        console.log('📅 [DASHBOARD] Fetching upcoming tests...');
        
        // Placeholder - implement with Test model later
        const upcomingTests = [];
        
        res.json({
            success: true,
            tests: upcomingTests
        });
    } catch (error) {
        console.error('❌ [DASHBOARD] Error fetching upcoming tests:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== RECENT ACTIVITY ====================
// GET /api/admin/dashboard/recent-activity
router.get('/dashboard/recent-activity', async (req, res) => {
    try {
        console.log('📋 [DASHBOARD] Fetching recent activity...');
        
        // Get recent student registrations
        const recentStudents = await Student.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('email fullName createdAt');
        
        // Get recent payments
        const recentPayments = await PaymentTransaction.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderId amount status createdAt');
        
        res.json({
            success: true,
            activity: {
                recentStudents,
                recentPayments
            }
        });
    } catch (error) {
        console.error('❌ [DASHBOARD] Error fetching activity:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ADMIN PROFILE ====================
// GET /api/admin/profile
router.get('/profile', async (req, res) => {
    try {
        console.log('👤 [ADMIN] Fetching admin profile...');
        
        // Placeholder admin profile - implement real auth later
        res.json({
            success: true,
            profile: {
                name: 'Admin User',
                email: 'admin@vigyanprep.com',
                role: 'Super Admin',
                avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff'
            }
        });
    } catch (error) {
        console.error('❌ [ADMIN] Error fetching profile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== NOTIFICATIONS ====================
// GET /api/admin/notifications
router.get('/notifications', async (req, res) => {
    try {
        console.log('🔔 [ADMIN] Fetching notifications...');
        
        // Placeholder notifications - implement real notification system later
        const notifications = [
            {
                id: 1,
                type: 'info',
                message: 'New student registered',
                timestamp: new Date(),
                read: false
            },
            {
                id: 2,
                type: 'success',
                message: 'Payment received: ₹499',
                timestamp: new Date(),
                read: false
            },
            {
                id: 3,
                type: 'warning',
                message: 'Test scheduled for tomorrow',
                timestamp: new Date(),
                read: true
            }
        ];
        
        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('❌ [ADMIN] Error fetching notifications:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/admin/notifications/count
router.get('/notifications/count', async (req, res) => {
    try {
        // Placeholder - return unread count
        res.json({
            success: true,
            count: 3
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/admin/notifications/:id/read
router.post('/notifications/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`✅ [ADMIN] Marking notification ${id} as read`);
        
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

console.log('✅ Admin Dashboard routes loaded');

export default router;