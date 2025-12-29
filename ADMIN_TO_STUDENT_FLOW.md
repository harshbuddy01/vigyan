# 🎯 COMPLETE ADMIN TO STUDENT QUESTION FLOW

## 📌 Overview

This document explains the **complete end-to-end flow** of how questions move from admin creation to student exam interface in the IIN platform.

---

## 🚦 FLOW DIAGRAM

```
👨‍💻 ADMIN                  💾 DATABASE              🎓 STUDENT
   │                         │                      │
   │  1. Opens Admin       │                      │
   │     Dashboard         │                      │
   │     (admin-           │                      │
   │      dashboard-v2.    │                      │
   │      html)            │                      │
   │                        │                      │
   │  2. Clicks "Add       │                      │
   │     Questions"        │                      │
   │                        │                      │
   │  3. Fills Form:       │                      │
   │     - Exam Type       │                      │
   │       (IISER/ISI/     │                      │
   │        NEST)          │                      │
   │     - Year (2025)     │                      │
   │     - Subject         │                      │
   │     - Question #      │                      │
   │     - Question Text   │                      │
   │     - Options A-D     │                      │
   │     - Correct Answer  │                      │
   │                        │                      │
   │  4. Clicks "Save      │                      │
   │     Question"         │                      │
   │                        │                      │
   │──POST /api/admin/─────>│                      │
   │    questions         │                      │
   │    {                 │                      │
   │      testId:         │                      │
   │       "IISER_2025",  │                      │
   │      examType:       │                      │
   │       "IISER",       │                      │
   │      year: "2025",   │                      │
   │      questionNumber: │                      │
   │       1,             │                      │
   │      questionText:   │                      │
   │       "...",         │                      │
   │      options: [...], │                      │
   │      correctAnswer:  │                      │
   │       "A",           │                      │
   │      section:        │                      │
   │       "Physics"      │                      │
   │    }                 │                      │
   │                        │                      │
   │                        │  5. Backend         │
   │                        │     Validates Data  │
   │                        │                      │
   │                        │  6. INSERT INTO     │
   │                        │     questions       │
   │                        │     (test_id,       │
   │                        │      question_      │
   │                        │      number,        │
   │                        │      question_text, │
   │                        │      options,       │
   │                        │      correct_answer,│
   │                        │      section,       │
   │                        │      marks_positive)│
   │                        │                      │
   │<───{success: true}──│                      │
   │                        │                      │
   │  7. Shows Success    │                      │
   │     Message          │                      │
   │     "✅ Question      │                      │
   │      Added!"         │                      │
   │                        │                      │
   │                        │                      │  8. Student Opens
   │                        │                      │     exam.html
   │                        │                      │     ?test=iiser
   │                        │                      │
   │                        │                      │  9. startExam()
   │                        │                      │     function runs
   │                        │                      │
   │                        │                      │──GET /api/exam/────>
   │                        │                      │   questions?
   │                        │                      │   testId=IISER_2025
   │                        │                      │
   │                        │  10. SELECT * FROM  │
   │                        │      questions      │
   │                        │      WHERE test_id= │
   │                        │      'IISER_2025'   │
   │                        │      ORDER BY       │
   │                        │      question_number│
   │                        │                      │
   │                        │                      │<──{questions: [...]}
   │                        │                      │
   │                        │                      │  11. Renders
   │                        │                      │      questions in
   │                        │                      │      exam interface
   │                        │                      │
   │                        │                      │  12. Student sees
   │                        │                      │      Question 1
   │                        │                      │      with options
   │                        │                      │      A, B, C, D
```

---

## 📦 1. ADMIN SIDE - ADDING QUESTIONS

### File: `admin-dashboard-v2.html`

**Navigation Path:**
1. Admin logs in → `admin-dashboard-v2.html`
2. Clicks sidebar: **"Add Questions"**
3. Loads: `frontend/js/add-questions.js`

### File: `frontend/js/add-questions.js`

**Form Fields:**

```javascript
// EXAM METADATA
examType: "IISER" | "ISI" | "NEST"
examYear: "2025" | "2024" | "2023" | ...
paperType: "A" | "B" | null  // Only for ISI

// AUTO-GENERATED
testId: `${examType}_${year}${paperType ? '_' + paperType : ''}`
// Examples:
// - "IISER_2025"
// - "ISI_2025_A"
// - "NEST_2024"

// QUESTION DETAILS
questionNumber: 1-120
subject: "Physics" | "Chemistry" | "Mathematics" | "Biology"
questionText: "Match the following..." (supports LaTeX)
optionA: "First option"
optionB: "Second option"
optionC: "Third option"
optionD: "Fourth option"
correctAnswer: "A" | "B" | "C" | "D"
marks: 4 (default)
difficulty: "Easy" | "Medium" | "Hard"
topic: "Mechanics" (optional)
explanation: "Solution..." (optional)
```

**Form Submission:**

```javascript
// When admin clicks "Save Question"
POST https://iin-production.up.railway.app/api/admin/questions

Headers: {
  'Content-Type': 'application/json'
}

Body: {
  "testId": "IISER_2025",
  "examType": "IISER",
  "year": "2025",
  "paperType": null,
  "questionNumber": 1,
  "questionText": "Match the entries in column I and column II.",
  "options": [
    "P-iv; Q-ii; R-i; S-iii",
    "P-iv; Q-i; R-ii; S-iii",
    "P-iii; Q-i; R-ii; S-iv",
    "P-i; Q-iii; R-ii; S-iv"
  ],
  "correctAnswer": "D",
  "section": "Biology",
  "marks": 4,
  "difficulty": "Medium",
  "topic": "Animal Taxonomy",
  "explanation": "..."
}
```

---

## 💾 2. BACKEND - SAVING TO DATABASE

### File: `backend/routes/questionRoutes.js`

**API Endpoint:**

```javascript
POST /api/admin/questions
```

**Validation Steps:**

1. ✅ Check required fields: `testId`, `examType`, `year`, `questionNumber`, `questionText`, `section`
2. ✅ Validate options array: Must have exactly 4 items
3. ✅ Validate correctAnswer: Must be A, B, C, or D
4. ✅ Check examType: Must be IISER, ISI, or NEST
5. ✅ For ISI: Require paperType (A or B)
6. ✅ Check duplicate: No existing question with same `testId + questionNumber + section`

**Database Insert:**

```sql
INSERT INTO questions (
  test_id,           -- "IISER_2025"
  question_number,   -- 1
  question_text,     -- "Match the entries..."
  options,           -- JSON: ["Option A", "Option B", ...]
  correct_answer,    -- "D"
  section,           -- "Biology"
  marks_positive,    -- 4
  marks_negative,    -- -1
  difficulty,        -- "Medium"
  topic,             -- "Animal Taxonomy"
  input_method,      -- "manual"
  created_at         -- NOW()
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
```

**Response to Admin:**

```json
{
  "success": true,
  "message": "Question added successfully",
  "question": {
    "id": 1234,
    "testId": "IISER_2025",
    "examType": "IISER",
    "year": "2025",
    "questionNumber": 1,
    "section": "Biology",
    "marks": 4,
    "difficulty": "Medium"
  }
}
```

---

## 🎓 3. STUDENT SIDE - VIEWING QUESTIONS

### File: `exam.html`

**How Student Accesses:**

```
https://iin-theta.vercel.app/exam.html?test=iiser
```

**Student Flow:**

1. **Page Loads:**
   - Checks if student is logged in
   - Checks if student purchased the test series
   - Maps `?test=iiser` to `testId=IISER_2025` (current year)

2. **Fetch Questions:**

```javascript
// exam.html - startExam() function
const testId = "IISER_2025"; // Derived from URL parameter + current year

const response = await axios.get(
  `${API_BASE_URL}/api/exam/questions?testId=${testId}`
);

// Response:
{
  "success": true,
  "testId": "IISER_2025",
  "count": 90,
  "questions": [
    {
      "id": 1234,
      "testId": "IISER_2025",
      "questionNumber": 1,
      "questionText": "Match the entries in column I and column II.",
      "options": [
        "P-iv; Q-ii; R-i; S-iii",
        "P-iv; Q-i; R-ii; S-iii",
        "P-iii; Q-i; R-ii; S-iv",
        "P-i; Q-iii; R-ii; S-iv"
      ],
      "optionA": "P-iv; Q-ii; R-i; S-iii",
      "optionB": "P-iv; Q-i; R-ii; S-iii",
      "optionC": "P-iii; Q-i; R-ii; S-iv",
      "optionD": "P-i; Q-iii; R-ii; S-iv",
      "correctAnswer": "D",
      "section": "Biology",
      "marks": 4,
      "negativeMarks": -1,
      "difficulty": "Medium",
      "topic": "Animal Taxonomy"
    },
    // ... 89 more questions
  ]
}
```

3. **Organize by Subject:**

```javascript
// exam.html organizes questions:
questionsBySubject = {
  "Physics": [Q1-Q30],      // questionNumber 1-30
  "Chemistry": [Q31-Q60],   // questionNumber 31-60
  "Mathematics": [Q61-Q90]  // questionNumber 61-90
}
```

4. **Render Question:**

```javascript
function loadQuestion() {
  const q = questionsBySubject[currentSubject][currentQIndex];
  
  // Display question number
  document.getElementById('qNumDisplay').innerText = 
    `Question No. ${q.questionNumber}`;
  
  // Display question text
  document.getElementById('questionText').innerHTML = q.questionText;
  
  // Display options
  options.forEach((optionText, index) => {
    // Create option card with radio button
    // Label: A, B, C, D
  });
  
  // Render LaTeX if present
  if (window.MathJax) window.MathJax.typesetPromise();
}
```

5. **Student Interaction:**
   - Student selects answer → Stored in `userResponses` object
   - Click "Save & Next" → Moves to next question
   - Click "Submit Test" → Sends all responses to backend

---

## 📊 DATABASE SCHEMA

### Table: `questions`

```sql
CREATE TABLE questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  test_id VARCHAR(50) NOT NULL,              -- "IISER_2025", "ISI_2025_A"
  question_number INT NOT NULL,              -- 1-120
  question_text TEXT NOT NULL,               -- Question content
  options JSON NOT NULL,                     -- ["A", "B", "C", "D"]
  correct_answer CHAR(1) NOT NULL,           -- 'A', 'B', 'C', 'D'
  section ENUM('Physics', 'Chemistry', 
               'Mathematics', 'Biology'),    -- Subject
  marks_positive DECIMAL(5,2) DEFAULT 4.00,  -- Marks for correct answer
  marks_negative DECIMAL(5,2) DEFAULT -1.00, -- Negative marking
  difficulty ENUM('Easy', 'Medium', 'Hard'), -- Difficulty level
  topic VARCHAR(255),                        -- Optional topic name
  input_method ENUM('pdf', 'manual', 
                    'image') DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
             ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_test_id (test_id),
  INDEX idx_section (section),
  INDEX idx_question_number (question_number),
  UNIQUE KEY unique_question (test_id, question_number, section)
);
```

**Sample Data:**

```sql
INSERT INTO questions VALUES (
  NULL,                           -- id (auto-increment)
  'IISER_2025',                  -- test_id
  1,                             -- question_number
  'Match the entries...',        -- question_text
  '["P-iv; Q-ii...", ...]',      -- options (JSON)
  'D',                           -- correct_answer
  'Biology',                     -- section
  4.00,                          -- marks_positive
  -1.00,                         -- marks_negative
  'Medium',                      -- difficulty
  'Animal Taxonomy',             -- topic
  'manual',                      -- input_method
  NOW(),                         -- created_at
  NOW()                          -- updated_at
);
```

---

## 🔑 KEY CONCEPTS

### 1. **Test ID Format**

```
Format: {EXAM_TYPE}_{YEAR}_{PAPER_TYPE (optional)}

Examples:
- IISER_2025       (IISER IAT 2025)
- ISI_2025_A       (ISI 2025 Paper A - MCQ)
- ISI_2025_B       (ISI 2025 Paper B - Subjective)
- NEST_2024        (NEST 2024)
```

### 2. **Question Numbering**

```
Subject Distribution (Standard):
- Physics:       Q1  - Q30  (30 questions)
- Chemistry:     Q31 - Q60  (30 questions)
- Mathematics:   Q61 - Q90  (30 questions)
- Biology:       Q91 - Q120 (30 questions) [if applicable]

Total: 90-120 questions per test
```

### 3. **Options Storage**

```json
// Stored as JSON array in database:
{
  "options": [
    "First option text",
    "Second option text",
    "Third option text",
    "Fourth option text"
  ]
}

// Retrieved as:
{
  "options": [...],
  "optionA": "First option text",
  "optionB": "Second option text",
  "optionC": "Third option text",
  "optionD": "Fourth option text"
}
```

---

## ✅ SUCCESS CRITERIA

### Admin Successfully Adds Question:

1. ✅ Admin fills all required fields
2. ✅ Form validates data
3. ✅ Backend receives POST request
4. ✅ Backend validates data
5. ✅ Question saved to MySQL database
6. ✅ Admin sees success message: "✅ Question added successfully!"
7. ✅ Question number auto-increments for next entry

### Student Successfully Sees Question:

1. ✅ Student opens exam with URL: `exam.html?test=iiser`
2. ✅ System maps `iiser` → `IISER_2025`
3. ✅ Backend fetches all questions for `IISER_2025`
4. ✅ Questions organized by subject
5. ✅ First question (Q1) displays with all 4 options
6. ✅ LaTeX renders correctly (if present)
7. ✅ Student can select answer and navigate

---

## 🛠️ TESTING THE FLOW

### Test Case 1: Add IISER Question

**Admin Steps:**
1. Open: `https://iin-theta.vercel.app/admin-dashboard-v2.html`
2. Click: "Add Questions" in sidebar
3. Fill form:
   - Exam Type: **IISER**
   - Year: **2025**
   - Subject: **Physics**
   - Question Number: **1**
   - Question Text: "A ball is thrown vertically upward..."
   - Option A: "10 m/s"
   - Option B: "20 m/s"
   - Option C: "30 m/s"
   - Option D: "40 m/s"
   - Correct Answer: **B**
   - Marks: **4**
4. Click: **"Save Question"**
5. Expect: ✅ Success message

**Student Verification:**
1. Open: `https://iin-theta.vercel.app/exam.html?test=iiser`
2. Expect: Question 1 displays with all options
3. Physics section shows 1 question in palette

### Test Case 2: Add ISI Question with Paper Type

**Admin Steps:**
1. Exam Type: **ISI**
2. Year: **2025**
3. Paper Type: **A** (MCQ)
4. Subject: **Mathematics**
5. Question Number: **1**
6. Fill remaining fields
7. Click: **"Save Question"**

**Expected testId:** `ISI_2025_A`

---

## 🐛 TROUBLESHOOTING

### Problem: Admin sees "Failed to add question"

**Solutions:**
1. Check browser console for error messages
2. Verify all required fields are filled
3. Check if question number already exists
4. Verify backend is running
5. Check Railway database connection

### Problem: Student sees "No questions found"

**Solutions:**
1. Verify testId format: `IISER_2025` (not `iiser` or `IISER2025`)
2. Check if questions exist in database for that testId
3. Verify student has purchased access to that test series
4. Check backend logs for SQL errors

### Problem: Options not displaying correctly

**Solutions:**
1. Verify options are stored as JSON array in database
2. Check if JSON parsing is successful
3. Verify all 4 options have text (not empty)

---

## 📌 IMPORTANT FILES

### Frontend
```
admin-dashboard-v2.html           // Admin dashboard
frontend/js/add-questions.js     // Admin question form
exam.html                         // Student exam interface
frontend/js/config.js            // API configuration
```

### Backend
```
backend/routes/questionRoutes.js  // Question API routes
backend/config/mysql.js           // Database connection
backend/migrations/               // Database schema
```

### Database
```
table: questions                  // Main questions table
table: student_attempts           // Student submissions
table: scheduled_tests            // Test scheduling
```

---

## 🚀 NEXT STEPS

1. **Test the complete flow:**
   - Add 3-5 questions as admin
   - Verify they appear in student exam interface
   - Test different exam types (IISER, ISI, NEST)

2. **Bulk Import Feature:**
   - Add CSV/Excel import for multiple questions
   - PDF extraction improvement

3. **Question Bank Management:**
   - Edit existing questions
   - Delete questions
   - Duplicate questions for different years

4. **Advanced Features:**
   - Image upload for questions
   - LaTeX preview in admin form
   - Question analytics

---

**Last Updated:** December 30, 2025
**Version:** 1.0
**Status:** ✅ Production Ready
