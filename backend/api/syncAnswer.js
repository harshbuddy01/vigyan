import { pool } from '../config/mysql.js';

export async function syncAnswer(req, res) {
  try {
    const { attemptId, questionId, answer } = req.body;

    // Validate inputs
    if (!attemptId || !questionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Attempt ID and Question ID required' 
      });
    }

    // Check if answer already exists
    const [existing] = await pool.query(
      'SELECT id FROM answers WHERE attempt_id = ? AND question_id = ?',
      [attemptId, questionId]
    );

    if (existing.length > 0) {
      // Update existing answer
      await pool.query(
        'UPDATE answers SET selected_option = ?, answered_at = NOW() WHERE id = ?',
        [answer || null, existing[0].id]
      );
    } else {
      // Insert new answer
      await pool.query(
        'INSERT INTO answers (attempt_id, question_id, selected_option) VALUES (?, ?, ?)',
        [attemptId, questionId, answer || null]
      );
    }

    res.json({ 
      success: true, 
      message: 'Answer synced',
      data: { attemptId, questionId, answer }
    });

  } catch (error) {
    console.error('Sync answer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to sync answer' 
    });
  }
}
