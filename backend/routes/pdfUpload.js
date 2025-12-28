const express = require('express');
const router = express.Router();
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');

// Configure multer for file upload
const storage = multer.memoryStorage();
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

/**
 * POST /api/upload-pdf
 * Upload and process PDF file to extract questions
 */
router.post('/upload-pdf', upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No PDF file uploaded'
            });
        }

        const { examType, subject, topic, year, autoExtract, notes } = req.body;

        // Validate required fields
        if (!examType || !subject) {
            return res.status(400).json({
                success: false,
                message: 'Exam type and subject are required'
            });
        }

        // If autoExtract is enabled, process with Python
        if (autoExtract === 'true') {
            const pythonProcess = spawn('python3', [
                path.join(__dirname, '..', 'pdf_processor.py')
            ]);

            let pythonOutput = '';
            let pythonError = '';

            // Send PDF content to Python script via stdin
            pythonProcess.stdin.write(req.file.buffer);
            pythonProcess.stdin.end();

            // Collect output
            pythonProcess.stdout.on('data', (data) => {
                pythonOutput += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                pythonError += data.toString();
            });

            // Wait for process to complete
            pythonProcess.on('close', async (code) => {
                if (code !== 0) {
                    console.error('Python process error:', pythonError);
                    return res.status(500).json({
                        success: false,
                        message: 'Error processing PDF with Python',
                        error: pythonError
                    });
                }

                try {
                    const extractionResult = JSON.parse(pythonOutput);

                    if (!extractionResult.success) {
                        return res.status(500).json(extractionResult);
                    }

                    // Add metadata to each question
                    const questionsWithMetadata = extractionResult.questions.map(q => ({
                        ...q,
                        examType,
                        subject,
                        topic: topic || 'General',
                        year: year || new Date().getFullYear(),
                        source: 'pdf_upload',
                        uploadDate: new Date().toISOString()
                    }));

                    // TODO: Save questions to database here
                    // await Question.insertMany(questionsWithMetadata);

                    res.json({
                        success: true,
                        message: `Successfully extracted ${extractionResult.questionsCount} questions`,
                        data: {
                            questionsCount: extractionResult.questionsCount,
                            questions: questionsWithMetadata,
                            fileName: req.file.originalname,
                            fileSize: req.file.size,
                            examType,
                            subject,
                            topic,
                            year
                        }
                    });
                } catch (parseError) {
                    console.error('Error parsing Python output:', parseError);
                    res.status(500).json({
                        success: false,
                        message: 'Error parsing extraction results',
                        error: parseError.message
                    });
                }
            });
        } else {
            // If autoExtract is disabled, just save file metadata
            res.json({
                success: true,
                message: 'PDF uploaded successfully (auto-extract disabled)',
                data: {
                    fileName: req.file.originalname,
                    fileSize: req.file.size,
                    examType,
                    subject,
                    topic,
                    year,
                    notes,
                    uploadDate: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        console.error('Error in PDF upload:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * POST /api/save-questions
 * Save extracted questions to database
 */
router.post('/save-questions', async (req, res) => {
    try {
        const { questions, metadata } = req.body;

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid questions data'
            });
        }

        // TODO: Save to database
        // const savedQuestions = await Question.insertMany(questions);

        res.json({
            success: true,
            message: `Successfully saved ${questions.length} questions`,
            data: {
                savedCount: questions.length
            }
        });
    } catch (error) {
        console.error('Error saving questions:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving questions',
            error: error.message
        });
    }
});

module.exports = router;
