import express from 'express';
import { 
  startTest, 
  submitExam, 
  getQuestions, 
  getStudentResults,
  getUserInfo 
} from '../controllers/examController.js';

const router = express.Router();

// ✅ NEW: Get user info (email, roll number, purchased tests)
router.post('/exam/user-info', getUserInfo);

// ✅ NEW: Start exam (verify access)
router.post('/exam/start', startTest);

// ✅ NEW: Get questions for a test
router.get('/exam/questions', getQuestions);

// ✅ NEW: Submit exam
router.post('/exam/submit', submitExam);

// ✅ NEW: Get student results/attempts
router.get('/exam/results', getStudentResults);

export default router;