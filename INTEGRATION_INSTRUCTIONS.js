/**
 * INTEGRATION GUIDE: How to Mount Pricing Routes in server.js
 * Copy this code into your backend/server.js file
 */

// ========== ADD THIS IMPORT AT THE TOP ==========
import adminTestPricingRoutes from './routes/adminTestPricingRoutes.js';

// ========== ADD THIS ROUTE AFTER OTHER ADMIN ROUTES ==========
// Example placement in server.js:

// ... existing imports and middleware ...

// Public routes
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);

// Admin routes (all require authentication)
app.use('/api/admin/students', requireAdminAuth, adminStudentRoutes);
app.use('/api/admin/questions', requireAdminAuth, adminQuestionRoutes);
app.use('/api/admin/transactions', requireAdminAuth, adminTransactionRoutes);

// 🆕 NEW: Test pricing management (admin only)
app.use('/api/admin/tests', requireAdminAuth, adminTestPricingRoutes);

// ... rest of server setup ...

/**
 * IMPORTANT NOTES:
 * 
 * 1. Make sure requireAdminAuth middleware exists in your project
 *    - It should verify JWT token and check admin role
 *    - Should set req.admin with admin info
 * 
 * 2. The routes will be available at:
 *    - GET    /api/admin/tests              (list all tests)
 *    - PATCH  /api/admin/tests/:testId/price (update price)
 *    - GET    /api/admin/tests/:testId/price-history (view history)
 * 
 * 3. All routes require Authorization header:
 *    Authorization: Bearer <admin-jwt-token>
 * 
 * 4. If you don't have requireAdminAuth, here's a basic example:
 */

// EXAMPLE: requireAdminAuth middleware (if you don't have it)
export const requireAdminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    req.admin = decoded; // Attach admin info to request
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
