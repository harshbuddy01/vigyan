import { pool } from "../config/mysql.js";

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

    // Find student by email or roll number in MySQL
    let query, params;
    
    if (email) {
      query = "SELECT * FROM students_payments WHERE email = ?";
      params = [email.toLowerCase().trim()];
    } else {
      query = "SELECT * FROM students_payments WHERE roll_number = ?";
      params = [rollNumber];
    }
    
    const [students] = await pool.query(query, params);

    if (students.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }

    const student = students[0];
    
    // Get purchased tests
    const [purchasedTests] = await pool.query(
      "SELECT test_id FROM purchased_tests WHERE email = ?",
      [student.email]
    );

    res.status(200).json({
      success: true,
      email: student.email,
      rollNumber: student.roll_number,
      purchasedTests: purchasedTests.map(t => t.test_id)
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
    
    // Find student in MySQL
    const [students] = await pool.query(
      "SELECT * FROM students_payments WHERE email = ? AND roll_number = ?",
      [normalizedEmail, rollNumber]
    );

    if (students.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid Roll Number or Email" 
      });
    }

    // Get purchased tests
    const [purchasedTests] = await pool.query(
      "SELECT test_id FROM purchased_tests WHERE email = ?",
      [normalizedEmail]
    );

    // Return purchased tests
    res.status(200).json({ 
      success: true, 
      purchasedTests: purchasedTests.map(t => t.test_id),
      rollNumber: students[0].roll_number
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
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Get student roll number if not provided
    let finalRollNumber = rollNumber;
    
    if (!finalRollNumber) {
      const [students] = await pool.query(
        "SELECT roll_number FROM students_payments WHERE email = ?",
        [normalizedEmail]
      );
      
      if (students.length > 0) {
        finalRollNumber = students[0].roll_number;
      } else {
        finalRollNumber = "N/A";
      }
    }
    
    // Calculate results
    const totalQuestions = userResponses.length;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    
    // Get correct answers from questions table
    const [questions] = await pool.query(
      "SELECT question_number, correct_answer FROM questions WHERE test_id = ? ORDER BY question_number",
      [testId]
    );
    
    const questionWiseResults = [];
    
    userResponses.forEach((userAnswer, index) => {
      const correctAnswer = questions[index]?.correct_answer;
      
      if (userAnswer === null || userAnswer === undefined) {
        unanswered++;
        questionWiseResults.push({
          questionNumber: index + 1,
          userAnswer: null,
          correctAnswer,
          isCorrect: false,
          status: 'unanswered'
        });
      } else if (userAnswer === correctAnswer) {
        correctAnswers++;
        questionWiseResults.push({
          questionNumber: index + 1,
          userAnswer,
          correctAnswer,
          isCorrect: true,
          status: 'correct'
        });
      } else {
        wrongAnswers++;
        questionWiseResults.push({
          questionNumber: index + 1,
          userAnswer,
          correctAnswer,
          isCorrect: false,
          status: 'wrong'
        });
      }
    });
    
    const score = correctAnswers;
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    // Save to student_attempts table
    await pool.query(
      `INSERT INTO student_attempts 
       (email, roll_number, test_id, test_name, total_questions, attempted_questions, 
        correct_answers, wrong_answers, unanswered, score, percentage, time_taken, 
        answers, question_wise_results, started_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizedEmail,
        finalRollNumber,
        testId,
        testName || testId,
        totalQuestions,
        totalQuestions - unanswered,
        correctAnswers,
        wrongAnswers,
        unanswered,
        score,
        percentage.toFixed(2),
        timeTaken || 0,
        JSON.stringify(userResponses),
        JSON.stringify(questionWiseResults),
        startedAt || new Date()
      ]
    );

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
    
    // Get questions from MySQL
    const [questions] = await pool.query(
      "SELECT id, test_id, question_number, question_text, options, difficulty, topic FROM questions WHERE test_id = ? ORDER BY question_number",
      [testId]
    );
    
    // Parse JSON options field
    const formattedQuestions = questions.map(q => ({
      _id: q.id,
      testId: q.test_id,
      questionNumber: q.question_number,
      questionText: q.question_text,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      difficulty: q.difficulty,
      topic: q.topic
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
    
    let query, params;
    
    if (email) {
      query = "SELECT * FROM student_attempts WHERE email = ? ORDER BY submitted_at DESC";
      params = [email.toLowerCase().trim()];
    } else {
      query = "SELECT * FROM student_attempts WHERE roll_number = ? ORDER BY submitted_at DESC";
      params = [rollNumber];
    }
    
    const [attempts] = await pool.query(query, params);
    
    // Parse JSON fields
    const formattedAttempts = attempts.map(attempt => ({
      ...attempt,
      answers: typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers,
      question_wise_results: typeof attempt.question_wise_results === 'string' 
        ? JSON.parse(attempt.question_wise_results) 
        : attempt.question_wise_results
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