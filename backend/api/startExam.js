import { pool } from '../config/mysql.js';

export async function startExam(req, res) {
  try {
    const { email, testId } = req.body;

    // Validate inputs
    if (!email || !testId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and Test ID required' 
      });
    }

    // Get student ID from email
    const [students] = await pool.query(
      'SELECT id, roll_number, email FROM students WHERE email = ?',
      [email.toLowerCase()]
    );

    if (students.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found. Please complete payment first.' 
      });
    }

    const student = students[0];

    // Get test details
    const [tests] = await pool.query(
      'SELECT * FROM tests WHERE test_id = ?',
      [testId.toLowerCase()]
    );

    if (tests.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test not found' 
      });
    }

    const test = tests[0];

    // Check if already attempted
    const [attempts] = await pool.query(
      'SELECT * FROM student_attempts WHERE student_id = ? AND test_id = ?',
      [student.id, test.id]
    );

    if (attempts.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already attempted this test',
        attempt: attempts[0]
      });
    }

    // Create new attempt
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + test.duration * 60000);

    const [result] = await pool.query(
      `INSERT INTO student_attempts 
       (student_id, test_id, start_time, end_time, status) 
       VALUES (?, ?, ?, ?, 'in_progress')`,
      [student.id, test.id, startTime, endTime]
    );

    const attemptId = result.insertId;

    // Get questions for this test
    const [questions] = await pool.query(
      'SELECT * FROM questions WHERE test_id = ? ORDER BY question_number',
      [test.id]
    );

    res.json({
      success: true,
      data: {
        attemptId,
        student: {
          id: student.id,
          email: student.email,
          rollNumber: student.roll_number
        },
        test: {
          id: test.id,
          testId: test.test_id,
          title: test.title,
          duration: test.duration,
          totalMarks: test.total_marks,
          totalQuestions: questions.length
        },
        timing: {
          startTime,
          endTime,
          duration: test.duration
        },
        questions: questions.map(q => ({
          id: q.id,
          questionNumber: q.question_number,
          questionText: q.question_text,
          optionA: q.option_a,
          optionB: q.option_b,
          optionC: q.option_c,
          optionD: q.option_d,
          marks: q.marks
        }))
      }
    });

  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start exam' 
    });
  }
}
