import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { pool } from '../config/mysql.js';
import { safeJsonParse } from '../utils/safeJsonParse.js';

const router = express.Router();

// ========== SCHEDULED TESTS MANAGEMENT ==========
// All routes here will be prefixed with /api/admin in server.js

// Create new scheduled test - POST /api/admin/create-test
router.post('/create-test', adminController.createScheduledTest);

// Get all scheduled tests - GET /api/admin/scheduled-tests
router.get('/scheduled-tests', adminController.getScheduledTests);

// Get specific test details - GET /api/admin/test/:testId
router.get('/test/:testId', adminController.getTestDetails);

// Update test status - PUT /api/admin/test/:testId/status
router.put('/test/:testId/status', adminController.updateTestStatus);

// Delete test - DELETE /api/admin/delete-test/:testId
router.delete('/delete-test/:testId', adminController.deleteTest);

// ========== QUESTIONS MANAGEMENT ==========

// Add question to test - POST /api/admin/add-question
router.post('/add-question', adminController.addQuestion);

// Get questions for a test - GET /api/admin/questions?testId=xxx&section=xxx
router.get('/questions', adminController.getTestQuestions);

// 🔥 FIXED: Get questions with safe JSON parsing - GET /api/admin/questions-fixed
router.get('/questions-fixed', async (req, res) => {
    try {
        console.log('🔍 [QUESTIONS-FIXED] Fetching questions from database...');

        const subject = req.query.subject || '';
        const difficulty = req.query.difficulty || '';
        const search = req.query.search || '';

        let query = 'SELECT * FROM questions';
        let conditions = [];
        let params = [];

        if (subject) {
            conditions.push('section = ?');
            params.push(subject);
        }
        if (difficulty) {
            conditions.push('difficulty = ?');
            params.push(difficulty);
        }
        if (search) {
            conditions.push('(question_text LIKE ? OR test_id LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY id DESC LIMIT 100';

        const [rows] = await pool.query(query, params);
        console.log(`📊 [QUESTIONS-FIXED] Found ${rows.length} rows from database`);

        // Safely map questions with proper error handling
        const questions = [];

        for (let i = 0; i < rows.length; i++) {
            const q = rows[i];

            try {
                // Safe JSON parse for options
                const options = safeJsonParse(q.options, []);

                // Skip questions with no valid options
                if (!Array.isArray(options) || options.length === 0) {
                    console.warn(`⚠️ [QUESTIONS-FIXED] Question ${q.id} has no valid options, skipping`);
                    continue;
                }

                questions.push({
                    id: q.id,
                    subject: q.section || 'Physics',
                    topic: q.topic || 'General',
                    difficulty: q.difficulty || 'Medium',
                    marks: q.marks_positive || 4,
                    question: q.question_text || '',
                    type: 'MCQ',
                    options: options,
                    answer: q.correct_answer || '',
                    testId: q.test_id || 'UNKNOWN'
                });
            } catch (mappingError) {
                console.error(`❌ [QUESTIONS-FIXED] Error mapping question ${q.id}:`, mappingError.message);
                continue;
            }
        }

        console.log(`✅ [QUESTIONS-FIXED] Successfully processed ${questions.length} questions`);
        res.json({ questions });

    } catch (error) {
        console.error('❌ [QUESTIONS-FIXED] Fatal error:', error);
        res.status(500).json({
            questions: [],
            error: error.message,
            message: 'Failed to fetch questions. Please check server logs.'
        });
    }
});

// 🧹 CLEANUP: Delete corrupted questions - GET /api/admin/cleanup-questions
router.get('/cleanup-questions', async (req, res) => {
    try {
        console.log('🧹 [CLEANUP] Starting questions cleanup...');

        const [beforeCount] = await pool.query('SELECT COUNT(*) as count FROM questions');
        const before = beforeCount[0]?.count || 0;
        console.log(`📊 [CLEANUP] Questions before cleanup: ${before}`);

        const [deleted1] = await pool.query(`
            DELETE FROM questions 
            WHERE test_id IS NULL 
               OR test_id = '' 
               OR test_id = '0'
               OR (CAST(test_id AS CHAR) REGEXP '^[0-9]+$' AND CAST(test_id AS UNSIGNED) < 1000)
        `);
        console.log(`🗑️ [CLEANUP] Deleted ${deleted1.affectedRows} questions with invalid test_id`);

        const [deleted2] = await pool.query(`
            DELETE FROM questions 
            WHERE correct_answer IS NULL 
               OR correct_answer = ''
        `);
        console.log(`🗑️ [CLEANUP] Deleted ${deleted2.affectedRows} questions with empty answers`);

        const [deleted3] = await pool.query(`
            DELETE FROM questions 
            WHERE options IS NULL 
               OR options = '' 
               OR options = '[]'
        `);
        console.log(`🗑️ [CLEANUP] Deleted ${deleted3.affectedRows} questions with empty options`);

        const [afterCount] = await pool.query('SELECT COUNT(*) as count FROM questions');
        const after = afterCount[0]?.count || 0;
        console.log(`📊 [CLEANUP] Questions after cleanup: ${after}`);

        const [remaining] = await pool.query(
            'SELECT id, test_id, section, correct_answer FROM questions ORDER BY id DESC LIMIT 10'
        );

        const summary = {
            success: true,
            message: 'Cleanup completed successfully',
            stats: {
                before,
                after,
                deleted: before - after,
                deletedByInvalidTestId: deleted1.affectedRows,
                deletedByEmptyAnswer: deleted2.affectedRows,
                deletedByEmptyOptions: deleted3.affectedRows
            },
            remainingQuestions: remaining
        };

        console.log('✅ [CLEANUP] Cleanup completed!');
        res.json(summary);

    } catch (error) {
        console.error('❌ [CLEANUP] Error during cleanup:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Cleanup failed. Please check server logs.'
        });
    }
});

// Update question - PUT /api/admin/update-question/:questionId
router.put('/update-question/:questionId', adminController.updateQuestion);

// Delete question - DELETE /api/admin/delete-question/:questionId
router.delete('/delete-question/:questionId', adminController.deleteQuestion);

// ========== STUDENT ACCESS ==========

// Get available tests for students - GET /api/admin/available-tests
router.get('/available-tests', adminController.getAvailableTests);

console.log('✅ Admin routes configured with /admin prefix');
console.log('✅ Fixed questions endpoint: GET /api/admin/questions-fixed');
console.log('✅ Cleanup endpoint: GET /api/admin/cleanup-questions');

export default router;
