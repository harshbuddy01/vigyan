# Backend PDF Route Integration

## Quick Setup

To integrate the PDF upload functionality with your backend, add this code to your `backend/server.js`:

### Step 1: Import the PDF Route (Add near top with other imports)

```javascript
import pdfRoutes from './routes/pdf.js';
```

**OR if using CommonJS (require):**
```javascript
const pdfRoutes = require('./routes/pdf.js');
```

### Step 2: Mount the PDF Route (Add with other app.use statements)

```javascript
app.use('/api/pdf', pdfRoutes);
```

**Full Example Location in server.js:**

```javascript
// Around line 20-30 with other imports
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import pdfRoutes from './routes/pdf.js';  // 👈 ADD THIS

// ... rest of your code ...

// Around line 350-360 with other route mounting
app.use("/api", paymentRoutes);
app.use("/api", adminRoutes);
app.use("/api", examRoutes);
app.use('/api/pdf', pdfRoutes);  // 👈 ADD THIS
```

### Step 3: Install Required Node Module

```bash
npm install multer
```

Multer is needed for handling file uploads.

### Step 4: Update routes/pdf.js for ES6 Modules

If your project uses ES6 modules (import/export), update `backend/routes/pdf.js`:

**Change the first few lines from:**
```javascript
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const db = require('../config/db');
```

**To:**
```javascript
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { pool } from '../config/mysql.js';
const router = express.Router();
```

**And change the last line from:**
```javascript
module.exports = router;
```

**To:**
```javascript
export default router;
```

**Also replace all `db.query` with `pool.query` and add await:**
```javascript
// OLD:
const result = await db.query(query, values);

// NEW:
const [result] = await pool.query(query, values);
```

### Step 5: Create Upload Directory

```bash
mkdir -p backend/uploads/pdfs
```

### Step 6: Test the Integration

1. Start your backend server
2. Check console for: `✅ PDF API: /api/pdf/*`
3. Navigate to admin panel → Upload PDF
4. Try uploading a test PDF

---

## Complete Updated pdf.js (ES6 Version)

If you need the complete ES6-compatible version, here it is:

```javascript
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
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// POST /api/pdf/upload
router.post('/upload', upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const { examType, subject, topic, year, autoExtract, notes } = req.body;
        const pdfPath = req.file.path;
        const fileName = req.file.originalname;

        console.log('📄 Processing PDF:', fileName);

        if (autoExtract === 'true') {
            console.log('🤖 Running AI extraction...');
            
            const pythonProcess = spawn('python3', [
                path.join(__dirname, '../pdf_processor.py'),
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

            pythonProcess.on('close', async (code) => {
                if (code !== 0) {
                    console.error('Python error:', pythonError);
                    return res.status(500).json({
                        error: 'PDF processing failed',
                        details: pythonError
                    });
                }

                try {
                    const result = JSON.parse(pythonOutput);
                    
                    if (result.error) {
                        return res.status(500).json({ error: result.error });
                    }

                    const savedQuestions = await saveQuestionsToDb(result.questions);
                    await saveUploadRecord({
                        fileName,
                        filePath: pdfPath,
                        examType,
                        subject,
                        topic,
                        year,
                        notes,
                        questionsExtracted: result.total_questions,
                        uploadDate: new Date()
                    });

                    res.json({
                        success: true,
                        message: 'PDF processed successfully',
                        totalQuestions: result.total_questions,
                        questionsExtracted: result.total_questions,
                        questions: result.questions,
                        savedQuestionIds: savedQuestions
                    });

                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    res.status(500).json({
                        error: 'Failed to parse extraction results',
                        details: parseError.message
                    });
                }
            });

        } else {
            await saveUploadRecord({
                fileName,
                filePath: pdfPath,
                examType,
                subject,
                topic,
                year,
                notes,
                questionsExtracted: 0,
                uploadDate: new Date()
            });

            res.json({
                success: true,
                message: 'PDF uploaded successfully',
                fileName
            });
        }

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Upload failed',
            details: error.message
        });
    }
});

async function saveQuestionsToDb(questions) {
    const savedIds = [];
    
    for (const q of questions) {
        try {
            const query = `
                INSERT INTO questions 
                (question_text, subject, exam_type, difficulty, topic, year, options, correct_answer, marks, has_math, section)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                q.subject || 'Physics'
            ];
            
            const [result] = await pool.query(query, values);
            savedIds.push(result.insertId);
        } catch (err) {
            console.error('Error saving question:', err);
        }
    }
    
    return savedIds;
}

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
    return result;
}

router.get('/history', async (req, res) => {
    try {
        const query = `
            SELECT id, file_name as original_name, exam_type, subject, 
                   questions_extracted, upload_date 
            FROM pdf_uploads 
            ORDER BY upload_date DESC 
            LIMIT 50
        `;
        
        const [results] = await pool.query(query);
        res.json({ success: true, uploads: results });
    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const getQuery = 'SELECT file_path FROM pdf_uploads WHERE id = ?';
        const [result] = await pool.query(getQuery, [id]);
        
        if (result.length > 0 && result[0].file_path) {
            if (fs.existsSync(result[0].file_path)) {
                fs.unlinkSync(result[0].file_path);
            }
        }
        
        const deleteQuery = 'DELETE FROM pdf_uploads WHERE id = ?';
        await pool.query(deleteQuery, [id]);
        
        res.json({ success: true, message: 'Upload deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete upload' });
    }
});

export default router;
```

Save this as `backend/routes/pdf.js` (overwriting the existing one).

---

## Verification

After integration, you should see in console:
```
✅ PDF API: /api/pdf/upload
✅ PDF API: /api/pdf/history  
✅ PDF API: /api/pdf/delete/:id
```

Test by uploading a PDF in the admin panel!
