# PDF Upload & Question Extraction System - Setup Guide

## Overview
This system allows admins to upload PDF files containing questions, which are automatically extracted using Python and saved to the question bank.

## Features
- ✅ Upload PDF files (max 10MB)
- ✅ Auto-extract questions with AI
- ✅ Math formula detection and LaTeX conversion
- ✅ Support for IAT, ISI, NEST exam types
- ✅ Automatic question bank integration
- ✅ Upload history tracking

## Prerequisites

### System Requirements
- Node.js 14+ 
- Python 3.8+
- MySQL/MariaDB

## Installation Steps

### 1. Install Python Dependencies

```bash
cd backend
pip3 install -r requirements.txt
```

Or install manually:
```bash
pip3 install PyPDF2==3.0.1
```

### 2. Install Node.js Dependencies

```bash
npm install multer
```

If not already installed, add to `package.json`:
```json
{
  "dependencies": {
    "multer": "^1.4.5-lts.1"
  }
}
```

### 3. Database Setup

Run the migration to create required tables:

```bash
mysql -u your_username -p your_database < backend/migrations/add_pdf_uploads_table.sql
```

Or manually execute:
```sql
source backend/migrations/add_pdf_uploads_table.sql;
```

### 4. Create Upload Directory

```bash
mkdir -p uploads/pdfs
chmod 755 uploads/pdfs
```

### 5. Update Server Configuration

Add the PDF upload route to your `backend/server.js`:

```javascript
// Add after other route imports
const pdfUploadRoutes = require('./routes/pdfUpload');

// Add after other route registrations
app.use('/api/pdf', pdfUploadRoutes);
```

### 6. Verify Python Installation

Test the Python script:
```bash
python3 backend/pdf_processor.py test.pdf
```

You should see JSON output with extracted questions.

## Usage

### For Admins

1. **Navigate to Upload PDF Section**
   - Open Admin Dashboard
   - Go to Question Bank → Upload PDF

2. **Select Exam Type**
   - IAT (IISER Aptitude Test)
   - ISI (Indian Statistical Institute)  
   - NEST (National Entrance Screening Test)

3. **Choose Subject**
   - Physics
   - Mathematics
   - Chemistry
   - Biology

4. **Upload PDF**
   - Drag & drop or click to browse
   - Maximum file size: 10MB
   - Check "Auto-extract questions" for automatic processing

5. **View Results**
   - Extracted questions automatically appear in View/Edit section
   - Upload history shows extraction statistics

## How It Works

### Question Extraction Process

1. **Upload**: Admin uploads PDF through web interface
2. **Processing**: Node.js receives file and calls Python script
3. **Extraction**: Python script:
   - Extracts text from PDF
   - Identifies question patterns (Q1, Q2, etc.)
   - Detects MCQ options (A, B, C, D)
   - Finds mathematical formulas
   - Converts math to LaTeX format
4. **Storage**: Questions saved to MySQL database
5. **Display**: Questions appear in View/Edit section

### Math Formula Handling

The system automatically detects and converts:
- Fractions: `3/4` → `\frac{3}{4}`
- Powers: `x^2` → `x^{2}`
- Subscripts: `x_1` → `x_{1}`
- Greek letters: `π, θ, α, β` → `\pi, \theta, \alpha, \beta`
- Symbols: `≤, ≥, ≠` → `\leq, \geq, \neq`
- Integrals, sums, products: `∫, ∑, ∏` → `\int, \sum, \prod`

## Troubleshooting

### Python Script Not Running

**Error**: `python3: command not found`

**Solution**: Install Python 3 or update the spawn command in `pdfUpload.js` to use `python` instead of `python3`

### File Upload Fails

**Error**: `ENOENT: no such file or directory`

**Solution**: Ensure `uploads/pdfs` directory exists:
```bash
mkdir -p uploads/pdfs
```

### Database Connection Error

**Error**: `ER_NO_SUCH_TABLE: Table 'pdf_uploads' doesn't exist`

**Solution**: Run the migration:
```bash
mysql -u username -p database < backend/migrations/add_pdf_uploads_table.sql
```

### No Questions Extracted

**Possible Causes**:
1. PDF is image-based (scanned) - text extraction won't work
2. Question format doesn't match patterns
3. PDF is encrypted or password-protected

**Solutions**:
- Use PDFs with selectable text
- Check PDF format matches expected patterns (Q1, Q2, etc.)
- Remove password protection before uploading

### Math Formulas Not Rendering

**Solution**: Ensure MathJax or KaTeX is loaded in your frontend:
```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
```

## File Structure

```
project/
├── backend/
│   ├── pdf_processor.py          # Python script for extraction
│   ├── requirements.txt          # Python dependencies
│   ├── routes/
│   │   └── pdfUpload.js         # API routes
│   └── migrations/
│       └── add_pdf_uploads_table.sql
├── frontend/
│   └── js/
│       └── upload-pdf.js        # Frontend interface
└── uploads/
    └── pdfs/                    # Uploaded files
```

## API Endpoints

### Upload PDF
```
POST /api/pdf/upload
Content-Type: multipart/form-data

Fields:
- pdfFile: File (required)
- examType: String (IAT/ISI/NEST)
- subject: String (Physics/Math/Chemistry/Biology)
- topic: String (optional)
- year: Number (optional)
- autoExtract: Boolean
- notes: String (optional)
```

### Get Upload History
```
GET /api/pdf/history

Response:
{
  "success": true,
  "uploads": [
    {
      "id": 1,
      "original_name": "IAT-Physics-2024.pdf",
      "exam_type": "IAT",
      "subject": "Physics",
      "questions_extracted": 50,
      "upload_date": "2024-12-28T12:00:00.000Z"
    }
  ]
}
```

### Delete Upload
```
DELETE /api/pdf/delete/:uploadId

Response:
{
  "success": true,
  "message": "Upload deleted successfully"
}
```

## Performance Considerations

- **Large PDFs**: Processing time increases with file size
- **Complex Layouts**: Multi-column or complex formats may reduce accuracy
- **Image-based PDFs**: Cannot extract text from scanned images (OCR required)
- **Concurrent Uploads**: System handles one upload at a time

## Security Notes

- File type validation enforced (PDF only)
- File size limit: 10MB
- Uploaded files stored securely in `uploads/pdfs/`
- SQL injection prevention through parameterized queries
- XSS protection through proper escaping

## Future Enhancements

- [ ] OCR support for scanned PDFs
- [ ] Batch PDF upload
- [ ] Advanced math formula detection
- [ ] Custom question pattern configuration
- [ ] Answer key auto-detection improvement
- [ ] Preview before saving
- [ ] Question editing before database insertion

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review browser console for JavaScript errors
3. Check server logs for backend errors
4. Verify Python script output manually

## Testing

Test the system with a sample PDF:

1. Create a test PDF with this format:
```
Q1. What is the value of π?
A) 3.14
B) 2.71
C) 1.41
D) 9.81

Q2. Solve: x² - 4 = 0
A) x = ±1
B) x = ±2  
C) x = ±3
D) x = ±4
```

2. Upload through admin interface
3. Verify questions appear in View/Edit section
4. Check math formulas render correctly

---

**Last Updated**: December 28, 2025
**Version**: 1.0.0
