import express from 'express';
import {
  // Admin dashboard
  getDashboardStats,
  getAdminProfile,
  getNotifications,
  getNotificationsCount,
  // Scheduled tests
  getScheduledTests,
  getPastTests, // ✅ Added past tests
  createScheduledTest,
  getTestDetails,
  updateTestStatus,
  deleteTest,
  // Questions
  addQuestion,
  getTestQuestions,
  updateQuestion,
  deleteQuestion,
  getAvailableTests
} from '../controllers/adminController.js';
import { verifyAdminAuth } from '../middlewares/adminAuth.js';

const router = express.Router();

// ✅ SECURITY FIX: Protect ALL admin routes
router.use(verifyAdminAuth);

// ========== DASHBOARD ENDPOINTS ==========
router.get('/stats', getDashboardStats);
router.get('/profile', getAdminProfile);
router.get('/notifications', getNotifications);
router.get('/notifications-count', getNotificationsCount);

// ========== SCHEDULED TESTS ENDPOINTS ==========
router.post('/tests', createScheduledTest);        // ✅ FIXED: POST /api/admin/tests
router.get('/scheduled-tests', getScheduledTests);  // ✅ Get all scheduled tests
router.get('/tests', getScheduledTests);            // ✅ GET /api/admin/tests
router.get('/past-tests', getPastTests);            // ✅ Get past tests (Fixes 404)
router.get('/tests/:testId', getTestDetails);      // ✅ Get specific test
router.put('/tests/:testId', updateTestStatus);    // ✅ FIXED: PUT /api/admin/tests/:id
router.delete('/tests/:testId', deleteTest);       // ✅ FIXED: DELETE /api/admin/tests/:id

// ========== QUESTIONS ENDPOINTS ==========
router.post('/questions/add', addQuestion);
router.get('/questions/:testId', getTestQuestions);
router.put('/questions/:questionId', updateQuestion);
router.delete('/questions/:questionId', deleteQuestion);
router.get('/available-tests', getAvailableTests);

export default router;
