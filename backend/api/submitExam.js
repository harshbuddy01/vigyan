import { pool } from '../config/mysql.js';

export async function submitExam(req, res) {
  try {
    const { attemptId } = req.body;

    if (!attemptId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Attempt ID required' 
      });
    }

    // Get attempt details
    const [attempts] = await pool.query(
      'SELECT * FROM student_attempts WHERE id = ?',
      [attemptId]
    );

    if (attempts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Attempt not found' 
      });
    }

    const attempt = attempts[0];

    if (attempt.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Exam already submitted' 
      });
    }

    // Calculate score
    const [answers] = await pool.query(
      `SELECT a.selected_option, q.correct_answer, q.marks
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.attempt_id = ?`,
      [attemptId]
    );

    let totalScore = 0;
    let correctAnswers = 0;

    answers.forEach(ans => {
      if (ans.selected_option === ans.correct_answer) {
        totalScore += ans.marks;
        correctAnswers++;
      }
    });

    // Update attempt
    await pool.query(
      `UPDATE student_attempts 
       SET status = 'completed', 
           submitted_at = NOW(), 
           score = ?, 
           correct_answers = ?
       WHERE id = ?`,
      [totalScore, correctAnswers, attemptId]
    );

    res.json({
      success: true,
      message: 'Exam submitted successfully',
      data: {
        attemptId,
        score: totalScore,
        correctAnswers,
        totalQuestions: answers.length
      }
    });

  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit exam' 
    });
  }
}
