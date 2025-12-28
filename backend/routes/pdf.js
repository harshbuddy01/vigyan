import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { pool } from '../config/mysql.js';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/pdfs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'pdf-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// POST /api/pdf/upload - Upload and process PDF
router.post('/upload', upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const { examType, subject, topic, year, autoExtract, notes } = req.body;
        const pdfPath = req.file.path;
        const fileName = req.file.originalname;

        console.log('📄 Processing PDF:', fileName);
        console.log('📋 Metadata:', { examType, subject, topic, year });
        console.log('🔧 Auto-extract enabled:', autoExtract);

        // If auto-extract is enabled, run Python script
        if (autoExtract === 'true') {
            console.log('🤖 Running AI extraction...');
            
            // Check if Python script exists
            const pythonScriptPath = path.join(__dirname, '../pdf_processor.py');
            if (!fs.existsSync(pythonScriptPath)) {
                console.error('❌ Python script not found:', pythonScriptPath);
                return res.status(500).json({
                    error: 'PDF processor script not found',
                    details: 'The pdf_processor.py script is missing from the backend folder'
                });
            }
            
            const pythonProcess = spawn('python3', [
                pythonScriptPath,
                pdfPath,
                examType || '',
                subject || '',
                topic || '',
                year || ''
            ]);

            let pythonOutput = '';
            let pythonError = '';

            pythonProcess.stdout.on('data', (data) => {
                pythonOutput += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                pythonError += data.toString();
            });

            pythonProcess.on('error', (error) => {
                console.error('❌ Failed to start Python process:', error);
                return res.status(500).json({
                    error: 'Failed to start PDF processor',
                    details: error.message,
                    hint: 'Make sure Python 3 is installed and PyPDF2 is available (pip3 install PyPDF2)'
                });
            });

            pythonProcess.on('close', async (code) => {
                console.log('🐍 Python process exited with code:', code);
                console.log('📤 Python stdout length:', pythonOutput.length);
                console.log('📤 Python stderr length:', pythonError.length);

                // Check if there's any output at all
                if (!pythonOutput || pythonOutput.trim() === '') {
                    console.error('❌ No output from Python script');
                    console.error('Python stderr:', pythonError);
                    return res.status(500).json({
                        error: 'PDF processing failed - no output from extractor',
                        details: pythonError || 'Python script produced no output',
                        hint: 'Make sure PyPDF2 is installed: pip3 install PyPDF2',
                        exitCode: code
                    });
                }

                // Check for non-zero exit code
                if (code !== 0) {
                    console.error('❌ Python error (exit code:', code, '):', pythonError);
                    return res.status(500).json({
                        error: 'PDF processing failed',
                        details: pythonError || pythonOutput || 'Unknown Python error',
                        exitCode: code,
                        hint: 'Check server logs for detailed Python error messages'
                    });
                }

                try {
                    // Validate JSON before parsing
                    const trimmedOutput = pythonOutput.trim();
                    console.log('📝 First 200 chars of output:', trimmedOutput.substring(0, 200));
                    
                    if (!trimmedOutput.startsWith('{') && !trimmedOutput.startsWith('[')) {
                        throw new Error('Output is not valid JSON. First 100 chars: ' + trimmedOutput.substring(0, 100));
                    }
                    
                    const result = JSON.parse(trimmedOutput);
                    console.log('✅ Successfully parsed JSON result');
                    console.log('📊 Result contains:', Object.keys(result));
                    
                    if (result.error || result.success === false) {
                        console.error('❌ Python script returned error:', result.error);
                        return res.status(500).json({ 
                            error: result.error || 'PDF processing failed',
                            pythonError: true,
                            details: result.error_type || 'Unknown error type'
                        });
                    }

                    if (!result.questions || !Array.isArray(result.questions)) {
                        console.warn('⚠️ No questions array in result');
                        return res.status(400).json({
                            error: 'No questions extracted from PDF',
                            details: 'The PDF might not contain properly formatted questions',
                            hint: 'Ensure questions are numbered (1., 2., Q1, etc.) with options A, B, C, D'
                        });
                    }

                    console.log('✅ Extracted', result.questions.length, 'questions');

                    // Save questions to database
                    const savedQuestions = await saveQuestionsToDb(result.questions);
                    console.log('💾 Saved', savedQuestions.length, 'questions to database');

                    // Save upload record
                    const uploadRecord = {
                        fileName: fileName,
                        filePath: pdfPath,
                        examType: examType,
                        subject: subject,
                        topic: topic,
                        year: year,
                        notes: notes,
                        questionsExtracted: result.total_questions || result.questions.length,
                        uploadDate: new Date()
                    };

                    await saveUploadRecord(uploadRecord);

                    // Create notification
                    try {
                        await pool.query(
                            'INSERT INTO admin_notifications (title, message, type, is_read, created_at) VALUES (?, ?, ?, 0, NOW())',
                            ['PDF Processed', `${result.total_questions || result.questions.length} questions extracted from ${fileName}`, 'success']
                        );
                    } catch (e) { 
                        console.warn('⚠️ Could not create notification:', e.message);
                    }

                    res.json({
                        success: true,
                        message: 'PDF processed successfully',
                        totalQuestions: result.total_questions || result.questions.length,
                        questionsExtracted: result.total_questions || result.questions.length,
                        questions: result.questions,
                        savedQuestionIds: savedQuestions
                    });

                } catch (parseError) {
                    console.error('❌ JSON Parse error:', parseError);
                    console.error('Raw output:', pythonOutput.substring(0, 500));
                    res.status(500).json({
                        error: 'Failed to parse extraction results',
                        details: parseError.message,
                        rawOutput: pythonOutput.substring(0, 200),
                        hint: 'The Python script output was not valid JSON. Check if PyPDF2 is installed.'
                    });
                }
            });

        } else {
            // Just save upload record without extraction
            console.log('📁 Saving PDF without extraction');
            const uploadRecord = {
                fileName: fileName,
                filePath: pdfPath,
                examType: examType,
                subject: subject,
                topic: topic,
                year: year,
                notes: notes,
                questionsExtracted: 0,
                uploadDate: new Date()
            };

            await saveUploadRecord(uploadRecord);

            res.json({
                success: true,
                message: 'PDF uploaded successfully (extraction disabled)',
                fileName: fileName
            });
        }

    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({
            error: 'Upload failed',
            details: error.message
        });
    }
});

// Helper function to save questions to database
async function saveQuestionsToDb(questions) {
    const savedIds = [];
    
    for (const q of questions) {
        try {
            const query = `
                INSERT INTO questions 
                (question_text, subject, exam_type, difficulty, topic, year, options, correct_answer, marks_positive, has_math, section, test_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const options = JSON.stringify(q.options);
            const values = [
                q.question_text,
                q.subject || '',
                q.examType || '',
                q.difficulty || 'medium',
                q.topic || '',
                q.year || '',
                options,
                q.answer || null,
                q.marks || 1,
                q.has_math ? 1 : 0,
                q.subject || 'Physics',
                'PDF_UPLOAD'
            ];
            
            const [result] = await pool.query(query, values);
            savedIds.push(result.insertId);
            console.log('✅ Question', q.question_number || savedIds.length, 'saved with ID:', result.insertId);
        } catch (err) {
            console.error('❌ Error saving question:', err.message);
        }
    }
    
    return savedIds;
}

// Helper function to save upload record
async function saveUploadRecord(record) {
    const query = `
        INSERT INTO pdf_uploads 
        (file_name, file_path, exam_type, subject, topic, year, notes, questions_extracted, upload_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        record.fileName,
        record.filePath,
        record.examType,
        record.subject,
        record.topic,
        record.year,
        record.notes,
        record.questionsExtracted,
        record.uploadDate
    ];
    
    const [result] = await pool.query(query, values);
    console.log('✅ Upload record saved with ID:', result.insertId);
    return result;
}

// GET /api/pdf/history - Get upload history
router.get('/history', async (req, res) => {
    try {
        const query = `
            SELECT id, file_name, exam_type, subject, topic, year, 
                   questions_extracted, upload_date 
            FROM pdf_uploads 
            ORDER BY upload_date DESC 
            LIMIT 50
        `;
        
        const [results] = await pool.query(query);
        console.log(`✅ Fetched ${results.length} upload records`);
        res.json({ success: true, uploads: results });
    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// DELETE /api/pdf/:id - Delete upload record
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get file path before deleting
        const getQuery = 'SELECT file_path FROM pdf_uploads WHERE id = ?';
        const [result] = await pool.query(getQuery, [id]);
        
        if (result.length > 0 && result[0].file_path) {
            // Delete physical file
            if (fs.existsSync(result[0].file_path)) {
                fs.unlinkSync(result[0].file_path);
                console.log('✅ PDF file deleted:', result[0].file_path);
            }
        }
        
        // Delete database record
        const deleteQuery = 'DELETE FROM pdf_uploads WHERE id = ?';
        await pool.query(deleteQuery, [id]);
        
        console.log('✅ Upload record deleted:', id);
        res.json({ success: true, message: 'Upload deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete upload' });
    }
});

export default router;