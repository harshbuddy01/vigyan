// DISABLED FOR MONGODB: import { pool } from "../config/mysql.js";
import { StudentPayment } from "../models/StudentPayment.js";
import { PurchasedTest } from "../models/PurchasedTest.js";
import QuestionModel from "../schemas/QuestionSchema.js";
import { StudentAttempt } from "../models/StudentAttempt.js";

// Helper function to safely parse JSON
const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (error) {
    console.error('JSON Parse Error:', error.message);
    return fallback;
  }
};

// Get user info (email, roll number, purchased tests)
export const getUserInfo = async (req, res) => {
  try {
    const { email, rollNumber } = req.body;
    
    if (!email && !rollNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "Email or Roll Number required" 
      });
    }

    // Find student in MongoDB
    let student;
    
    if (email) {
      student = await StudentPayment.findOne({ email: email.toLowerCase().trim() });
    } else {
      student = await StudentPayment.findOne({ roll_number: rollNumber });
    }

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }
    
    // Get purchased tests
    const purchasedTestDocs = await PurchasedTest.find({
      email: student.email
    });

    res.status(200).json({
      success: true,
      email: student.email,
      rollNumber: student.roll_number,
      purchasedTests: purchasedTestDocs.map(t => t.test_id)
    });
    
  } catch (error) {
    console.error("getUserInfo Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Start test (verify student has access)
export const startTest = async (req, res) => {
  try {
    const { rollNumber, email } = req.body;
    
    if (!email || !rollNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and Roll Number required" 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Find student in MongoDB
    const student = await StudentPayment.findOne({
      email: normalizedEmail,
      roll_number: rollNumber
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid Roll Number or Email" 
      });
    }

    // Get purchased tests
    const purchasedTestDocs = await PurchasedTest.find({
      email: normalizedEmail
    });

    // Return purchased tests
    res.status(200).json({ 
      success: true, 
      purchasedTests: purchasedTestDocs.map(t => t.test_id),
      rollNumber: student.roll_number
    });
    
  } catch (error) {
    console.error("startTest Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Submit exam
export const submitExam = async (req, res) => {
  try {
    const { email, rollNumber, testId, testName, userResponses, timeTaken, startedAt } = req.body;
    
    // Validate required fields
    if (!email || !testId || !userResponses || !Array.isArray(userResponses)) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, testId, and userResponses (array) are required" 
      });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Get student roll number if not provided
    let finalRollNumber = rollNumber;
    
    if (!finalRollNumber) {
      const student = await StudentPayment.findOne({
        email: normalizedEmail
      });
      
      if (student) {
        finalRollNumber = student.roll_number;
      } else {
        finalRollNumber = "N/A";
      }
    }
    
    // Calculate results
    const totalQuestions = userResponses.length;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    
    // Get correct answers from questions collection
    const questions = await QuestionModel.find({
      testId: testId
    }).sort({ questionNumber: 1 });
    
    if (questions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No questions found for this test" 
      });
    }
    
    // Create a map for easier lookup by question number
    const correctAnswersMap = {};
    questions.forEach((q, index) => {
      correctAnswersMap[index + 1] = q.correctAnswer;
    });
    
    const questionWiseResults = [];
    
    userResponses.forEach((userAnswer, index) => {
      const questionNumber = index + 1;
      const correctAnswer = correctAnswersMap[questionNumber];
      
      if (userAnswer === null || userAnswer === undefined) {
        unanswered++;
        questionWiseResults.push({
          questionNumber,
          userAnswer: null,
          correctAnswer,
          isCorrect: false,
          status: 'unanswered'
        });
      } else if (userAnswer === correctAnswer) {
        correctAnswers++;
        questionWiseResults.push({
          questionNumber,
          userAnswer,
          correctAnswer,
          isCorrect: true,
          status: 'correct'
        });
      } else {
        wrongAnswers++;
        questionWiseResults.push({
          questionNumber,
          userAnswer,
          correctAnswer,
          isCorrect: false,
          status: 'wrong'
        });
      }
    });
    
    const score = correctAnswers;
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    // Save to student_attempts collection
    const attempt = await StudentAttempt.create({
      email: normalizedEmail,
      roll_number: finalRollNumber,
      test_id: testId,
      test_name: testName || testId,
      total_questions: totalQuestions,
      attempted_questions: totalQuestions - unanswered,
      correct_answers: correctAnswers,
      wrong_answers: wrongAnswers,
      unanswered: unanswered,
      score: score,
      percentage: parseFloat(percentage.toFixed(2)),
      time_taken: timeTaken || 0,
      answers: userResponses,
      question_wise_results: questionWiseResults,
      started_at: startedAt || new Date(),
      submitted_at: new Date()
    });

    res.status(200).json({ 
      success: true, 
      message: "Exam Saved Successfully",
      results: {
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        unanswered,
        score,
        percentage: percentage.toFixed(2)
      }
    });
    
  } catch (error) {
    console.error("submitExam Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get questions for a specific test
export const getQuestions = async (req, res) => {
  try {
    const { testId } = req.query;
    
    if (!testId) {
      return res.status(400).json({ 
        success: false, 
        message: "Test ID required" 
      });
    }
    
    // Get questions from MongoDB
    const questions = await QuestionModel.find({
      testId: testId
    }).sort({ questionNumber: 1 });
    
    if (questions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No questions found for this test" 
      });
    }
    
    // Format response
    const formattedQuestions = questions.map(q => ({
      _id: q._id,
      testId: q.testId,
      questionNumber: q.questionNumber || q._id.toString().charCodeAt(0) % 100,
      questionText: q.questionText,
      options: Array.isArray(q.options) ? q.options : safeJsonParse(q.options, [])
    }));
    
    res.status(200).json({ 
      success: true, 
      questions: formattedQuestions 
    });
    
  } catch (error) {
    console.error("getQuestions Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student results/attempts
export const getStudentResults = async (req, res) => {
  try {
    const { email, rollNumber } = req.query;
    
    if (!email && !rollNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "Email or Roll Number required" 
      });
    }
    
    let query = {};
    
    if (email) {
      query = { email: email.toLowerCase().trim() };
    } else {
      query = { roll_number: rollNumber };
    }
    
    const attempts = await StudentAttempt.find(query).sort({ submitted_at: -1 });
    
    // Format response
    const formattedAttempts = attempts.map(attempt => ({
      ...attempt.toObject(),
      answers: Array.isArray(attempt.answers) ? attempt.answers : safeJsonParse(attempt.answers, []),
      question_wise_results: Array.isArray(attempt.question_wise_results) ? attempt.question_wise_results : safeJsonParse(attempt.question_wise_results, [])
    }));
    
    res.status(200).json({ 
      success: true, 
      attempts: formattedAttempts 
    });
    
  } catch (error) {
    console.error("getStudentResults Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};