import express from 'express';
import * as adminController from '../controllers/adminController.js';
// DISABLED FOR MONGODB: import { pool } from '../config/mysql.js';
// DISABLED FOR MONGODB: import { safeJsonParse } from '../utils/safeJsonParse.js';

const router = express.Router();

// ========== DASHBOARD ====================
// ✅ FIXED: Dashboard stats route MUST be here, not in separate file
// Get dashboard stats - GET /api/admin/dashboard/stats
router.get('/dashboard/stats', adminController.getDashboardStats);

// ========== ADMIN PROFILE & NOTIFICATIONS ==========
// All routes here will be prefixed with /api/admin in server.js

// Get admin profile - GET /api/admin/profile
router.get('/profile', adminController.getAdminProfile);

// Get notifications - GET /api/admin/notifications
router.get('/notifications', adminController.getNotifications);

// Get notifications count - GET /api/admin/notifications/count
router.get('/notifications/count', adminController.getNotificationsCount);

// ========== SCHEDULED TESTS MANAGEMENT ==========

// Create new scheduled test - POST /api/admin/create-test
router.post('/create-test', adminController.createScheduledTest);

// Get all scheduled tests - GET /api/admin/scheduled-tests
router.get('/scheduled-tests', adminController.getScheduledTests);

// Get specific test details - GET /api/admin/test/:testId
router.get('/test/:testId', adminController.getTestDetails);

// Update test status - PUT /api/admin/test/:testId/status
router.put('/test/:testId/status', adminController.updateTestStatus);

// Delete test - DELETE /api/admin/delete-test/:testId
router.delete('/delete-test/:testId', adminController.deleteTest);

// ========== QUESTIONS MANAGEMENT ==========

// Add question to test - POST /api/admin/add-question
router.post('/add-question', adminController.addQuestion);

// Get questions for a test - GET /api/admin/questions?testId=xxx&section=xxx
router.get('/questions', adminController.getTestQuestions);

// 🔥 DISABLED FOR MONGODB MIGRATION
// These endpoints used raw SQL - will be replaced with OOP/Repository pattern
router.get('/questions-fixed', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'This endpoint is temporarily disabled during MongoDB migration. Use OOP question endpoints instead.'
    });
});

router.get('/cleanup-questions', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'This endpoint is temporarily disabled during MongoDB migration.'
    });
});

// Update question - PUT /api/admin/update-question/:questionId
router.put('/update-question/:questionId', adminController.updateQuestion);

// Delete question - DELETE /api/admin/delete-question/:questionId
router.delete('/delete-question/:questionId', adminController.deleteQuestion);

// ========== STUDENT ACCESS ==========

// Get available tests for students - GET /api/admin/available-tests
router.get('/available-tests', adminController.getAvailableTests);

console.log('✅ Admin routes configured with /admin prefix');
console.log('✅ Dashboard/stats, Profile, Notifications endpoints added');
console.log('⚠️ MySQL-based endpoints temporarily disabled for MongoDB migration');

export default router;