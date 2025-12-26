import { pool } from "../config/mysql.js";

// Helper function to safely parse JSON
const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (error) {
    console.error('JSON Parse Error:', error.message);
    return fallback;
  }
};

// Login Logic
export const adminLogin = (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    res.status(200).json({ success: true, message: "Welcome Boss!" });
  } else {
    res.status(403).json({ success: false, message: "Wrong Password!" });
  }
};

// Question Management
export const uploadQuestion = async (req, res) => {
  try {
    const { testId, questionNumber, questionText, image, options, correctAnswer, subject, difficulty, topic, explanation } = req.body;
    
    // Validate required fields
    if (!testId || !questionText || !options || !correctAnswer) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: testId, questionText, options, and correctAnswer are required" 
      });
    }
    
    // Insert question into MySQL
    const [result] = await pool.query(
      `INSERT INTO questions 
       (test_id, question_number, question_text, options, correct_answer, difficulty, topic, explanation) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testId,
        questionNumber || 1,
        questionText,
        JSON.stringify(options), // Store as JSON
        correctAnswer,
        difficulty || 'medium',
        topic || subject,
        explanation || ''
      ]
    );
    
    console.log('Question uploaded:', result.insertId);
    res.status(200).json({ 
      success: true, 
      message: "Question Added!", 
      questionId: result.insertId 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, message: "Question ID is required" });
    }
    
    const [result] = await pool.query("DELETE FROM questions WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all questions (for admin panel analytics and manage)
export const getAllQuestions = async (req, res) => {
  try {
    const [questions] = await pool.query(
      "SELECT * FROM questions ORDER BY created_at DESC"
    );
    
    // Parse JSON options field with error handling
    const formattedQuestions = questions.map(q => ({
      _id: q.id, // For compatibility with frontend
      id: q.id,
      testId: q.test_id,
      questionNumber: q.question_number,
      questionText: q.question_text,
      options: safeJsonParse(q.options, []), // ✅ Safe parsing
      correctAnswer: q.correct_answer,
      difficulty: q.difficulty,
      topic: q.topic,
      explanation: q.explanation,
      createdAt: q.created_at,
      updatedAt: q.updated_at
    }));
    
    console.log(`Found ${formattedQuestions.length} questions`);
    res.status(200).json({ success: true, questions: formattedQuestions });
    
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all students (using students_payments table)
export const getAllStudents = async (req, res) => {
  try {
    // Get all students with their purchased tests
    const [students] = await pool.query(
      `SELECT 
        sp.email,
        sp.roll_number,
        sp.created_at,
        sp.updated_at,
        GROUP_CONCAT(pt.test_id) as purchased_tests,
        COUNT(pt.test_id) as total_purchases
      FROM students_payments sp
      LEFT JOIN purchased_tests pt ON sp.email = pt.email
      GROUP BY sp.email, sp.roll_number, sp.created_at, sp.updated_at
      ORDER BY sp.created_at DESC`
    );
    
    // Format for frontend compatibility
    const formattedStudents = students.map(s => ({
      _id: s.email, // Use email as ID for compatibility
      email: s.email,
      rollNumber: s.roll_number,
      purchasedTests: s.purchased_tests ? s.purchased_tests.split(',') : [],
      totalPurchases: s.total_purchases || 0,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));
    
    console.log(`Found ${formattedStudents.length} students`);
    res.status(200).json({ success: true, students: formattedStudents });
    
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all feedbacks (Note: Feedback table not yet created, return empty for now)
export const getFeedbacks = async (req, res) => {
  try {
    // Check if feedback table exists
    const [tables] = await pool.query(
      "SHOW TABLES LIKE 'feedbacks'"
    );
    
    if (tables.length === 0) {
      console.log('Feedback table does not exist yet');
      return res.status(200).json({ success: true, feedbacks: [] });
    }
    
    const [feedbacks] = await pool.query(
      "SELECT * FROM feedbacks ORDER BY created_at DESC"
    );
    
    // Parse JSON fields safely
    const formattedFeedbacks = feedbacks.map(f => ({
      ...f,
      ratings: safeJsonParse(f.ratings, {})
    }));
    
    console.log(`Found ${formattedFeedbacks.length} feedbacks`);
    res.status(200).json({ success: true, feedbacks: formattedFeedbacks });
    
  } catch (error) {
    console.error('Get feedbacks error:', error);
    // Return empty array instead of error to prevent admin panel crash
    res.status(200).json({ success: true, feedbacks: [] });
  }
};

// Data Viewing - Results with Questions
export const getResults = async (req, res) => {
  try {
    // Get all student attempts (results)
    const [results] = await pool.query(
      "SELECT * FROM student_attempts ORDER BY submitted_at DESC"
    );
    
    // Get all questions
    const [questions] = await pool.query(
      "SELECT * FROM questions ORDER BY test_id, question_number"
    );
    
    // Parse JSON fields in results with error handling
    const formattedResults = results.map(r => ({
      _id: r.id, // For compatibility
      id: r.id,
      email: r.email,
      rollNumber: r.roll_number,
      testId: r.test_id,
      testName: r.test_name,
      totalQuestions: r.total_questions,
      attemptedQuestions: r.attempted_questions,
      correctAnswers: r.correct_answers,
      wrongAnswers: r.wrong_answers,
      unanswered: r.unanswered,
      score: parseFloat(r.score) || 0,
      percentage: parseFloat(r.percentage) || 0,
      timeTaken: r.time_taken,
      answers: safeJsonParse(r.answers, []), // ✅ Safe parsing
      questionWiseResults: safeJsonParse(r.question_wise_results, []), // ✅ Safe parsing
      startedAt: r.started_at,
      submittedAt: r.submitted_at,
      submissionTime: r.submitted_at, // For compatibility
      status: r.status
    }));
    
    // Parse JSON fields in questions with error handling
    const formattedQuestions = questions.map(q => ({
      _id: q.id,
      id: q.id,
      testId: q.test_id,
      subject: q.topic, // Map topic to subject for compatibility
      questionNumber: q.question_number,
      questionText: q.question_text,
      options: safeJsonParse(q.options, []), // ✅ Safe parsing
      correctAnswer: q.correct_answer,
      difficulty: q.difficulty,
      topic: q.topic,
      explanation: q.explanation
    }));
    
    console.log(`Found ${formattedResults.length} results and ${formattedQuestions.length} questions`);
    res.status(200).json({ 
      success: true, 
      results: formattedResults, 
      questions: formattedQuestions 
    });
    
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Additional admin endpoints

// Get analytics/statistics
export const getAnalytics = async (req, res) => {
  try {
    // Total students
    const [studentCount] = await pool.query(
      "SELECT COUNT(*) as total FROM students_payments"
    );
    
    // Total questions
    const [questionCount] = await pool.query(
      "SELECT COUNT(*) as total FROM questions"
    );
    
    // Total attempts
    const [attemptCount] = await pool.query(
      "SELECT COUNT(*) as total FROM student_attempts"
    );
    
    // Total revenue (sum of all payments)
    const [revenue] = await pool.query(
      "SELECT SUM(amount) as total FROM payment_transactions WHERE status = 'paid'"
    );
    
    res.status(200).json({
      success: true,
      analytics: {
        totalStudents: studentCount[0]?.total || 0,
        totalQuestions: questionCount[0]?.total || 0,
        totalAttempts: attemptCount[0]?.total || 0,
        totalRevenue: revenue[0]?.total || 0
      }
    });
    
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};