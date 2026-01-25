import express from 'express';
import { 
  startTest, 
  submitExam, 
  getQuestions, 
  getStudentResults,
  getUserInfo,
  listScheduledTests
} from '../controllers/examController.js';

const router = express.Router();

// ✅ List all scheduled tests (for admin calendar)
router.get('/list', listScheduledTests);

// ✅ Get user info (email, roll number, purchased tests)
router.post('/user-info', getUserInfo);

// ✅ Start exam (verify access)
router.post('/start', startTest);

// ✅ Get questions for a test
router.get('/questions', getQuestions);

// ✅ Submit exam
router.post('/submit', submitExam);

// ✅ Get student results/attempts
router.get('/results', getStudentResults);

export default router;