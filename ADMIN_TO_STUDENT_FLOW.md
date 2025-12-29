# 🎯 Admin to Student Question Flow - Complete Documentation

## 🚀 Overview

This document explains the **complete end-to-end flow** of how questions move from Admin upload to Student exam interface.

---

## 📊 Flow Diagram

```
┌─────────────────┐
│  ADMIN UPLOADS  │
│   QUESTION     │
└───────┬────────┘
        │
        │ POST /api/admin/questions
        │ {
        │   examType: "IISER",
        │   year: "2025",
        │   questionNumber: 1,
        │   questionText: "...",
        │   options: [...],
        │   correctAnswer: "A",
        │   section: "Physics"
        │ }
        │
        │
┌───────┴────────┐
│   BACKEND      │
│  VALIDATES &   │
│   SAVES TO     │
│    MySQL       │
└───────┬────────┘
        │
        │ Generates testId: "IISER_2025"
        │ Inserts into questions table
        │
        │
┌───────┴────────┐
│   DATABASE     │
│  questions    │
│    table      │
└───────┬────────┘
        │
        │ GET /api/exam/questions?testId=IISER_2025
        │
        │
┌───────┴────────┐
│   STUDENT      │
│ SEES QUESTION │
│  IN EXAM UI   │
└─────────────────┘
```

---

## 💻 1. Admin Upload Interface

### File: `frontend/js/add-questions-v2.js`

**Admin fills form with:**

| Field | Type | Example | Required |
|-------|------|---------|----------|
| Exam Type | Dropdown | IISER / ISI / NEST | ✅ Yes |
| Year | Dropdown | 2025, 2024, 2023... | ✅ Yes |
| Paper Type | Dropdown (ISI only) | A / B | ⚠️ ISI Only |
| Subject | Dropdown | Physics / Chemistry / Math | ✅ Yes |
| Question Number | Number | 1, 2, 3... | ✅ Yes |
| Question Text | Textarea | "What is..." | ✅ Yes |
| Option A | Text | "First option" | ✅ Yes |
| Option B | Text | "Second option" | ✅ Yes |
| Option C | Text | "Third option" | ✅ Yes |
| Option D | Text | "Fourth option" | ✅ Yes |
| Correct Answer | Dropdown | A / B / C / D | ✅ Yes |
| Marks | Number | 4 (default) | ✅ Yes |

**Generated TestId Format:**
```javascript
// IISER
testId = "IISER_2025"

// ISI with Paper Type
testId = "ISI_2025_A"  // Paper A
testId = "ISI_2025_B"  // Paper B

// NEST
testId = "NEST_2025"
```

**Payload sent to backend:**
```javascript
POST https://iin-production.up.railway.app/api/admin/questions

Content-Type: application/json

{
  "testId": "IISER_2025",
  "examType": "IISER",
  "year": "2025",
  "paperType": null,
  "questionNumber": 1,
  "questionText": "If a particle moves with velocity v = 3t^2 + 2t, what is acceleration at t=2?",
  "options": [
    "10 m/s²",
    "12 m/s²",
    "14 m/s²",
    "16 m/s²"
  ],
  "correctAnswer": "C",
  "section": "Physics",
  "marks": 4
}
```

---

## 🔧 2. Backend Processing

### File: `backend/routes/questionRoutes.js`

**Route:** `POST /api/admin/questions`

**Validation Steps:**

1. ✅ Check required fields (testId, examType, year, questionNumber, questionText, section)
2. ✅ Validate options array (must have exactly 4 items)
3. ✅ Validate correctAnswer (must be A, B, C, or D)
4. ✅ Validate examType (must be IISER, ISI, or NEST)
5. ✅ For ISI, ensure paperType is provided
6. ✅ Check if question number already exists for this test+section

**Database Insert:**
```sql
INSERT INTO questions (
    test_id,           -- "IISER_2025"
    question_number,   -- 1
    question_text,     -- "If a particle moves..."
    options,           -- '["10 m/s²", "12 m/s²", "14 m/s²", "16 m/s²"]'
    correct_answer,    -- "C"
    section,           -- "Physics"
    marks_positive,    -- 4
    marks_negative,    -- -1
    difficulty,        -- "Medium"
    topic,             -- NULL
    input_method,      -- "manual"
    created_at         -- NOW()
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
```

**Success Response:**
```json
{
  "success": true,
  "message": "Question added successfully",
  "question": {
    "id": 1234,
    "testId": "IISER_2025",
    "examType": "IISER",
    "year": "2025",
    "paperType": null,
    "questionNumber": 1,
    "section": "Physics",
    "marks": 4,
    "difficulty": "Medium",
    "topic": null
  }
}
```

---

## 💾 3. Database Schema

### Table: `questions`

```sql
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id VARCHAR(50) NOT NULL,           -- "IISER_2025", "ISI_2025_A"
    question_number INT NOT NULL,            -- 1, 2, 3...
    question_text TEXT NOT NULL,             -- Question content
    options JSON NOT NULL,                   -- ["A", "B", "C", "D"]
    correct_answer CHAR(1) NOT NULL,         -- "A", "B", "C", "D"
    section VARCHAR(50) NOT NULL,            -- "Physics", "Chemistry", "Mathematics"
    marks_positive INT DEFAULT 4,            -- Correct answer marks
    marks_negative INT DEFAULT -1,           -- Wrong answer penalty
    difficulty VARCHAR(20) DEFAULT 'Medium', -- "Easy", "Medium", "Hard"
    topic VARCHAR(100),                      -- "Mechanics", "Algebra", etc.
    input_method VARCHAR(20) DEFAULT 'manual', -- "manual", "pdf", "bulk"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for fast retrieval
    INDEX idx_test_id (test_id),
    INDEX idx_section (section),
    INDEX idx_test_section (test_id, section),
    
    -- Ensure no duplicate question numbers per test+section
    UNIQUE KEY unique_question (test_id, question_number, section)
);
```

**Sample Data:**
```sql
INSERT INTO questions VALUES
(1, 'IISER_2025', 1, 'What is...?', '["A", "B", "C", "D"]', 'A', 'Physics', 4, -1, 'Medium', 'Mechanics', 'manual', NOW()),
(2, 'IISER_2025', 2, 'Calculate...', '["A", "B", "C", "D"]', 'B', 'Physics', 4, -1, 'Hard', 'Thermodynamics', 'manual', NOW()),
(3, 'IISER_2025', 31, 'Find derivative...', '["A", "B", "C", "D"]', 'C', 'Mathematics', 4, -1, 'Easy', 'Calculus', 'manual', NOW());
```

---

## 🎯 4. Student Exam Interface

### File: `exam.html`

**Student Flow:**

1. Student logs in (`signinpage.html`)
2. Selects test series (IISER/ISI/NEST)
3. Clicks "Start Test"
4. `exam.html` loads with query parameter: `exam.html?test=IISER_2025`

**Backend Request:**
```javascript
GET https://iin-production.up.railway.app/api/exam/questions?testId=IISER_2025
```

**Backend Response:**
```json
{
  "success": true,
  "testId": "IISER_2025",
  "count": 90,
  "questions": [
    {
      "id": 1,
      "testId": "IISER_2025",
      "questionNumber": 1,
      "questionText": "If a particle moves with velocity v = 3t^2 + 2t, what is acceleration at t=2?",
      "options": ["10 m/s²", "12 m/s²", "14 m/s²", "16 m/s²"],
      "optionA": "10 m/s²",
      "optionB": "12 m/s²",
      "optionC": "14 m/s²",
      "optionD": "16 m/s²",
      "correctAnswer": "C",
      "section": "Physics",
      "marks": 4,
      "negativeMarks": -1,
      "difficulty": "Medium",
      "topic": "Kinematics"
    },
    // ... 89 more questions
  ]
}
```

**Question Display:**
- Questions 1-30: Physics
- Questions 31-60: Chemistry
- Questions 61-90: Mathematics

---

## 🛠️ 5. Testing the Flow

### Step 1: Admin Uploads Question

1. Open `admin-dashboard-v2.html`
2. Click "Add Questions" in sidebar
3. Fill form:
   - Exam Type: **IISER**
   - Year: **2025**
   - Subject: **Physics**
   - Question Number: **1**
   - Question Text: "Test question"
   - Options A-D: "Option A", "Option B", "Option C", "Option D"
   - Correct Answer: **A**
   - Marks: **4**
4. Click "Add Question"
5. Success message: "✅ Question 1 added successfully for IISER_2025!"

### Step 2: Verify in Database

```sql
SELECT * FROM questions WHERE test_id = 'IISER_2025' ORDER BY question_number;
```

Expected Output:
```
+----+-----------+------------------+-----------------+--------+------------------+---------+
| id | test_id   | question_number  | question_text   | ... | section | marks  |
+----+-----------+------------------+-----------------+--------+------------------+---------+
| 1  | IISER_2025|        1         | Test question   | ... | Physics |   4    |
+----+-----------+------------------+-----------------+--------+------------------+---------+
```

### Step 3: Student Views Question

1. Open `exam.html?test=IISER_2025`
2. Login as student
3. Question 1 appears: "Test question"
4. Options displayed: A, B, C, D
5. Select answer and submit

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Question number already exists"
**Cause:** Admin tried to add question with duplicate number
**Solution:** Use a different question number OR update the existing question

### Issue 2: "No questions found for this test"
**Cause:** testId mismatch between admin upload and student request
**Solution:** Ensure testId format matches exactly (case-sensitive)

### Issue 3: "Options not displaying"
**Cause:** JSON parsing error in options field
**Solution:** Backend safely parses JSON; check database data format

---

## 📝 Example Test IDs

| Exam | Year | Paper | TestId |
|------|------|-------|--------|
| IISER IAT | 2025 | - | `IISER_2025` |
| IISER IAT | 2024 | - | `IISER_2024` |
| ISI B.Stat/B.Math | 2025 | A | `ISI_2025_A` |
| ISI B.Stat/B.Math | 2025 | B | `ISI_2025_B` |
| NEST | 2025 | - | `NEST_2025` |
| NEST | 2024 | - | `NEST_2024` |

---

## 🚀 Quick Start Commands

### 1. Add Question via Admin Panel
```
1. Navigate to: http://localhost:5173/admin-dashboard-v2.html
2. Click: "Add Questions"
3. Fill form and submit
```

### 2. Test API Directly (cURL)
```bash
curl -X POST https://iin-production.up.railway.app/api/admin/questions \
  -H "Content-Type: application/json" \
  -d '{
    "testId": "IISER_2025",
    "examType": "IISER",
    "year": "2025",
    "questionNumber": 1,
    "questionText": "Test question?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "section": "Physics",
    "marks": 4
  }'
```

### 3. Fetch Questions as Student
```bash
curl https://iin-production.up.railway.app/api/exam/questions?testId=IISER_2025
```

---

## ✅ Success Checklist

- [ ] Admin can upload question via form
- [ ] Backend validates all fields
- [ ] Question saved to MySQL database
- [ ] Student can fetch questions by testId
- [ ] Questions display correctly in exam interface
- [ ] Submit exam and calculate score

---

## 📞 Support

For issues or questions:
- Check backend logs for detailed error messages
- Verify database connection
- Ensure API_BASE_URL is correct in config.js

**Last Updated:** December 30, 2025, 3:38 AM IST