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

// Create scheduled test
export const createScheduledTest = async (req, res) => {
  try {
    const { testId, testName, testType, examDate, startTime, durationMinutes, description } = req.body;
    
    if (!testId || !testName || !testType || !examDate || !startTime) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // Check if test already exists
    const [existing] = await pool.query(
      "SELECT test_id FROM scheduled_tests WHERE test_id = ?",
      [testId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Test with this ID already exists" 
      });
    }

    // Insert test
    await pool.query(
      `INSERT INTO scheduled_tests 
       (test_id, test_name, test_type, exam_date, start_time, duration_minutes, description, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [testId, testName, testType, examDate, startTime, durationMinutes || 180, description]
    );

    // Create default sections
    const sections = ['Physics', 'Chemistry', 'Maths', 'Biology'];
    for (let i = 0; i < sections.length; i++) {
      await pool.query(
        `INSERT INTO test_sections (test_id, section_name, total_questions, section_order) 
         VALUES (?, ?, 30, ?)`,
        [testId, sections[i], i + 1]
      );
    }

    res.status(200).json({ 
      success: true, 
      message: "Test scheduled successfully",
      testId 
    });
    
  } catch (error) {
    console.error("createScheduledTest Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all scheduled tests
export const getScheduledTests = async (req, res) => {
  try {
    const [tests] = await pool.query(
      `SELECT st.*, 
              COUNT(q.id) as total_questions
       FROM scheduled_tests st
       LEFT JOIN questions q ON st.test_id = q.test_id
       GROUP BY st.id
       ORDER BY st.exam_date DESC`
    );

    res.status(200).json({ 
      success: true, 
      tests 
    });
    
  } catch (error) {
    console.error("getScheduledTests Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add question to test
export const addQuestion = async (req, res) => {
  try {
    const { 
      testId, 
      section, 
      questionNumber, 
      questionText, 
      questionImageUrl,
      options, 
      correctAnswer, 
      hasLatex,
      marksPositive,
      marksNegative,
      inputMethod 
    } = req.body;
    
    if (!testId || !section || !questionNumber || !questionText || !options || !correctAnswer) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // Check if question number already exists for this test and section
    const [existing] = await pool.query(
      "SELECT id FROM questions WHERE test_id = ? AND section = ? AND question_number = ?",
      [testId, section, questionNumber]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Question ${questionNumber} already exists in ${section} section` 
      });
    }

    // Insert question
    await pool.query(
      `INSERT INTO questions 
       (test_id, section, question_number, question_text, question_image_url, options, 
        correct_answer, has_latex, marks_positive, marks_negative, input_method) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testId,
        section,
        questionNumber,
        questionText,
        questionImageUrl || null,
        JSON.stringify(options),
        correctAnswer,
        hasLatex || false,
        marksPositive || 4.00,
        marksNegative || -1.00,
        inputMethod || 'manual'
      ]
    );

    res.status(200).json({ 
      success: true, 
      message: "Question added successfully" 
    });
    
  } catch (error) {
    console.error("addQuestion Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get questions for a test (optionally filtered by section)
export const getTestQuestions = async (req, res) => {
  try {
    const { testId, section } = req.query;
    
    if (!testId) {
      return res.status(400).json({ 
        success: false, 
        message: "Test ID required" 
      });
    }

    let query = "SELECT * FROM questions WHERE test_id = ?";
    const params = [testId];

    if (section) {
      query += " AND section = ?";
      params.push(section);
    }

    query += " ORDER BY section, question_number";

    const [questions] = await pool.query(query, params);

    // Parse options JSON
    const formattedQuestions = questions.map(q => ({
      ...q,
      options: safeJsonParse(q.options, {})
    }));

    res.status(200).json({ 
      success: true, 
      questions: formattedQuestions 
    });
    
  } catch (error) {
    console.error("getTestQuestions Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update question
export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { 
      questionText, 
      questionImageUrl,
      options, 
      correctAnswer, 
      hasLatex 
    } = req.body;
    
    if (!questionId) {
      return res.status(400).json({ 
        success: false, 
        message: "Question ID required" 
      });
    }

    await pool.query(
      `UPDATE questions 
       SET question_text = ?, question_image_url = ?, options = ?, 
           correct_answer = ?, has_latex = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        questionText,
        questionImageUrl || null,
        JSON.stringify(options),
        correctAnswer,
        hasLatex || false,
        questionId
      ]
    );

    res.status(200).json({ 
      success: true, 
      message: "Question updated successfully" 
    });
    
  } catch (error) {
    console.error("updateQuestion Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete question
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    if (!questionId) {
      return res.status(400).json({ 
        success: false, 
        message: "Question ID required" 
      });
    }

    await pool.query("DELETE FROM questions WHERE id = ?", [questionId]);

    res.status(200).json({ 
      success: true, 
      message: "Question deleted successfully" 
    });
    
  } catch (error) {
    console.error("deleteQuestion Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete test (and all its questions)
export const deleteTest = async (req, res) => {
  try {
    const { testId } = req.params;
    
    if (!testId) {
      return res.status(400).json({ 
        success: false, 
        message: "Test ID required" 
      });
    }

    // Delete questions first
    await pool.query("DELETE FROM questions WHERE test_id = ?", [testId]);
    
    // Delete test sections
    await pool.query("DELETE FROM test_sections WHERE test_id = ?", [testId]);
    
    // Delete scheduled test
    await pool.query("DELETE FROM scheduled_tests WHERE test_id = ?", [testId]);

    res.status(200).json({ 
      success: true, 
      message: "Test and all questions deleted successfully" 
    });
    
  } catch (error) {
    console.error("deleteTest Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get test details with section-wise question count
export const getTestDetails = async (req, res) => {
  try {
    const { testId } = req.params;
    
    if (!testId) {
      return res.status(400).json({ 
        success: false, 
        message: "Test ID required" 
      });
    }

    // Get test info
    const [tests] = await pool.query(
      "SELECT * FROM scheduled_tests WHERE test_id = ?",
      [testId]
    );

    if (tests.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
      });
    }

    // Get section-wise question count
    const [sectionCounts] = await pool.query(
      `SELECT section, COUNT(*) as count 
       FROM questions 
       WHERE test_id = ? 
       GROUP BY section`,
      [testId]
    );

    res.status(200).json({ 
      success: true, 
      test: tests[0],
      sectionCounts 
    });
    
  } catch (error) {
    console.error("getTestDetails Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get available tests for students (only tests that are active on current date/time)
export const getAvailableTests = async (req, res) => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    const [tests] = await pool.query(
      `SELECT st.*, 
              COUNT(q.id) as total_questions
       FROM scheduled_tests st
       LEFT JOIN questions q ON st.test_id = q.test_id
       WHERE st.exam_date = ? 
         AND st.start_time <= ?
         AND st.status = 'scheduled'
       GROUP BY st.id`,
      [currentDate, currentTime]
    );

    res.status(200).json({ 
      success: true, 
      tests 
    });
    
  } catch (error) {
    console.error("getAvailableTests Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update test status (manually activate/complete)
export const updateTestStatus = async (req, res) => {
  try {
    const { testId } = req.params;
    const { status } = req.body;
    
    if (!testId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Test ID and status required" 
      });
    }

    if (!['scheduled', 'active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }

    await pool.query(
      "UPDATE scheduled_tests SET status = ? WHERE test_id = ?",
      [status, testId]
    );

    res.status(200).json({ 
      success: true, 
      message: `Test status updated to ${status}` 
    });
    
  } catch (error) {
    console.error("updateTestStatus Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};