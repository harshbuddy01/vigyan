/**
 * Question Domain Model
 * Created: Dec 29, 2025
 * Purpose: Encapsulate all question-related logic and data
 * 
 * FIXES:
 * - JSON parsing errors (recursive parsing, safe fallbacks)
 * - Data validation (prevents bad data in database)
 * - Consistent data format across application
 * 
 * BENEFITS:
 * - Single source of truth for question structure
 * - Reusable across different parts of application
 * - Easy to test and maintain
 * - Type safety and validation built-in
 */

export class Question {
    constructor(data = {}) {
        // Database fields (snake_case)
        this.id = data.id || null;
        this.testId = data.test_id || data.testId || null;
        this.questionNumber = data.question_number || data.questionNumber || 0;
        
        // Question content
        this.text = data.question_text || data.text || data.question || '';
        this.options = this._parseOptions(data.options);
        this.correctAnswer = data.correct_answer || data.correctAnswer || data.answer || '';
        
        // Metadata
        this.section = data.section || 'Physics';
        this.topic = data.topic || 'General';
        this.difficulty = data.difficulty || 'Medium';
        this.marks = data.marks_positive || data.marks || 4;
        this.negativeMarks = data.marks_negative || data.negativeMarks || -1;
        
        // Type (for future expansion: MCQ, Numerical, etc.)
        this.type = data.type || 'MCQ';
        
        // Timestamps
        this.createdAt = data.created_at || data.createdAt || null;
        this.updatedAt = data.updated_at || data.updatedAt || null;
    }
    
    /**
     * BULLETPROOF JSON PARSING
     * Handles all edge cases:
     * - Already an array: return as-is
     * - String: parse recursively (handles double/triple encoding)
     * - Invalid: return empty array with warning
     * - Null/undefined: return empty array
     */
    _parseOptions(options) {
        // Case 1: Already an array
        if (Array.isArray(options)) {
            return options;
        }
        
        // Case 2: Null/undefined
        if (!options) {
            return [];
        }
        
        // Case 3: String - parse recursively
        if (typeof options === 'string') {
            try {
                let parsed = options;
                let iterations = 0;
                const maxIterations = 5; // Prevent infinite loops
                
                // Keep parsing until we get an array or hit max iterations
                while (typeof parsed === 'string' && iterations < maxIterations) {
                    parsed = JSON.parse(parsed);
                    iterations++;
                }
                
                // Final check: is it an array?
                if (Array.isArray(parsed)) {
                    return parsed;
                }
                
                console.warn(`⚠️  Question ${this.id || 'new'}: Options parsed but not an array:`, typeof parsed);
                return [];
                
            } catch (error) {
                console.error(`❌ Question ${this.id || 'new'}: Failed to parse options:`, error.message);
                console.error('   Raw options:', options.substring(0, 100));
                return [];
            }
        }
        
        // Case 4: Unknown type
        console.warn(`⚠️  Question ${this.id || 'new'}: Unexpected options type:`, typeof options);
        return [];
    }
    
    /**
     * Validate question data
     * Returns: { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];
        
        // Required fields
        if (!this.text || this.text.trim().length < 5) {
            errors.push('Question text must be at least 5 characters long');
        }
        
        if (!this.testId) {
            errors.push('Test ID is required');
        }
        
        // Options validation
        if (!Array.isArray(this.options) || this.options.length === 0) {
            errors.push('Question must have at least one option');
        }
        
        if (this.options.length > 0 && this.options.length < 2) {
            errors.push('Question must have at least 2 options');
        }
        
        if (this.options.length > 6) {
            errors.push('Question cannot have more than 6 options');
        }
        
        // Check for empty options
        if (this.options.some(opt => !opt || opt.trim().length === 0)) {
            errors.push('All options must be non-empty');
        }
        
        // Correct answer validation
        if (!this.correctAnswer || this.correctAnswer.trim().length === 0) {
            errors.push('Correct answer is required');
        }
        
        if (this.options.length > 0 && !this.options.includes(this.correctAnswer)) {
            errors.push('Correct answer must be one of the provided options');
        }
        
        // Marks validation
        if (this.marks < 1 || this.marks > 10) {
            errors.push('Marks must be between 1 and 10');
        }
        
        if (this.negativeMarks > 0) {
            errors.push('Negative marks should be negative or zero');
        }
        
        // Section validation
        const validSections = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General'];
        if (!validSections.includes(this.section)) {
            errors.push(`Section must be one of: ${validSections.join(', ')}`);
        }
        
        // Difficulty validation
        const validDifficulties = ['Easy', 'Medium', 'Hard'];
        if (!validDifficulties.includes(this.difficulty)) {
            errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Check if answer is correct
     */
    checkAnswer(studentAnswer) {
        return this.correctAnswer.trim().toLowerCase() === studentAnswer.trim().toLowerCase();
    }
    
    /**
     * Get marks for this answer
     */
    getMarks(studentAnswer) {
        if (this.checkAnswer(studentAnswer)) {
            return this.marks;
        }
        return this.negativeMarks;
    }
    
    /**
     * Convert to database format (snake_case)
     */
    toDatabaseFormat() {
        return {
            id: this.id,
            test_id: this.testId,
            question_number: this.questionNumber,
            question_text: this.text,
            options: JSON.stringify(this.options), // Always store as JSON string
            correct_answer: this.correctAnswer,
            section: this.section,
            topic: this.topic,
            difficulty: this.difficulty,
            marks_positive: this.marks,
            marks_negative: this.negativeMarks,
            type: this.type
        };
    }
    
    /**
     * Convert to API response format (frontend expects this)
     */
    toJSON() {
        return {
            id: this.id,
            question: this.text,
            options: this.options,
            answer: this.correctAnswer,
            subject: this.section,
            topic: this.topic,
            difficulty: this.difficulty,
            marks: this.marks,
            negativeMarks: this.negativeMarks,
            type: this.type,
            testId: this.testId,
            questionNumber: this.questionNumber
        };
    }
    
    /**
     * Convert to exam format (without answer)
     */
    toExamFormat() {
        return {
            id: this.id,
            question: this.text,
            options: this.options,
            subject: this.section,
            topic: this.topic,
            difficulty: this.difficulty,
            marks: this.marks,
            negativeMarks: this.negativeMarks,
            type: this.type,
            questionNumber: this.questionNumber
        };
    }
    
    /**
     * Create Question from database row
     */
    static fromDatabase(row) {
        return new Question(row);
    }
    
    /**
     * Create multiple Questions from database rows
     */
    static fromDatabaseRows(rows) {
        return rows.map(row => Question.fromDatabase(row));
    }
    
    /**
     * Create Question from API request
     */
    static fromRequest(data) {
        return new Question({
            text: data.questionText || data.question,
            options: data.options,
            correctAnswer: data.correctAnswer || data.answer,
            section: data.section || data.subject,
            topic: data.topic,
            difficulty: data.difficulty,
            marks: data.marks,
            negativeMarks: data.negativeMarks,
            testId: data.testId,
            type: data.type
        });
    }
}

export default Question;
