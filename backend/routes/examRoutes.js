import express from 'express';
import { 
  startTest, 
  submitExam, 
  getQuestions, 
  getStudentResults,
  getUserInfo 
} from '../controllers/examController.js';

const router = express.Router();

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