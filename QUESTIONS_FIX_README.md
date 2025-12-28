# Questions Endpoint Fix

Date: 2025-12-29

## Problem
The `/api/admin/questions` endpoint was throwing HTTP 500 errors because of JSON parsing issues in the `options` field.

## Solution Implemented

### 1. Created Safe JSON Parser
- **File**: `backend/utils/safeJsonParse.js`
- **Purpose**: Safely parse JSON with proper fallbacks
- **Usage**: Prevents crashes when encountering invalid JSON

### 2. Created Fixed Questions Endpoint
- **File**: `backend/routes/questionsRouteFixed.js`
- **Endpoint**: `GET /api/admin/questions-fixed`
- **Features**:
  - Safe JSON parsing with fallbacks
  - Skips questions with invalid data
  - Detailed error logging
  - Never crashes, always returns valid response

### 3. Created Cleanup Endpoint
- **File**: `backend/routes/cleanupRoute.js`
- **Endpoint**: `GET /api/admin/cleanup-questions`
- **Purpose**: Clean up corrupted questions from database

## How to Use

### Option 1: Use Fixed Endpoint (Temporary)

Test the fixed endpoint:
```
https://iin-production.up.railway.app/api/admin/questions-fixed
```

This will return questions safely without crashing.

### Option 2: Update Frontend (Recommended)

Update your frontend to use the new endpoint:

**File**: `frontend/js/view-edit.js` or wherever questions are fetched

**Change**:
```javascript
// OLD:
fetch('/api/admin/questions')

// NEW:
fetch('/api/admin/questions-fixed')
```

### Option 3: Replace Original Endpoint in server.js

In `backend/server.js`, around line 310, replace the questions endpoint with:

```javascript
import { safeJsonParse } from './utils/safeJsonParse.js';

// ... (at top of file)

// Then replace the /api/admin/questions endpoint (line 310-330) with:
app.get('/api/admin/questions', async (req, res) => {
    try {
        console.log('🔍 Fetching questions from MySQL database...');
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
        
        // FIX: Safe mapping with proper error handling
        const questions = [];
        for (const q of rows) {
            try {
                const options = safeJsonParse(q.options, []);
                if (Array.isArray(options) && options.length > 0) {
                    questions.push({
                        id: q.id,
                        subject: q.section || 'Physics',
                        topic: q.topic || 'General',
                        difficulty: q.difficulty || 'Medium',
                        marks: q.marks_positive || 4,
                        question: q.question_text,
                        type: 'MCQ',
                        options: options,
                        answer: q.correct_answer
                    });
                }
            } catch (e) {
                console.warn(`Skipping question ${q.id}:`, e.message);
            }
        }
        
        console.log(`✅ Loaded ${questions.length} questions from database`);
        res.json({questions});
    } catch (error) {
        console.error('❌ Questions API error:', error);
        res.status(500).json({
            questions: [],
            error: error.message
        });
    }
});
```

## Testing

### Test the fixed endpoint:
```bash
curl https://iin-production.up.railway.app/api/admin/questions-fixed
```

Should return:
```json
{
  "questions": [
    {
      "id": 2,
      "subject": "Mathematics",
      "topic": "General",
      "difficulty": "Medium",
      "marks": 4,
      "question": "...",
      "type": "MCQ",
      "options": [...],
      "answer": "C",
      "testId": "NEST_2026_01"
    }
  ]
}
```

## Current Status

✅ Safe JSON parser created  
✅ Fixed questions endpoint created  
✅ Cleanup endpoint created  
⏳ Need to update frontend OR replace original endpoint  

## Next Steps

1. Wait for Railway deployment to complete
2. Test the `/api/admin/questions-fixed` endpoint
3. Update frontend to use the fixed endpoint
4. View/Edit page will work!
