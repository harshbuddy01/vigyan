/**
 * Question Service
 * Created: Dec 29, 2025
 * Purpose: Business logic layer for question management
 * 
 * SERVICE LAYER BENEFITS:
 * - Separates business rules from routes
 * - Reusable across different endpoints
 * - Easy to test
 * - Handles validation, error handling, and data transformation
 */

import { QuestionRepository } from '../repositories/QuestionRepository.js';
import { Question } from '../models/Question.js';

export class QuestionService {
    constructor() {
        this.repository = new QuestionRepository();
    }
    
    /**
     * Get all questions with filters
     */
    async getAllQuestions(filters = {}) {
        try {
            console.log('🔍 [QuestionService] Fetching questions with filters:', filters);
            
            const startTime = Date.now();
            const questions = await this.repository.findAll(filters);
            const responseTime = Date.now() - startTime;
            
            console.log(`✅ [QuestionService] Found ${questions.length} questions in ${responseTime}ms`);
            
            return {
                success: true,
                questions: questions.map(q => q.toJSON()),
                count: questions.length,
                responseTime: `${responseTime}ms`
            };
            
        } catch (error) {
            console.error('❌ [QuestionService] Error fetching questions:', error);
            throw new Error(`Failed to fetch questions: ${error.message}`);
        }
    }
    
    /**
     * Get question by ID
     */
    async getQuestionById(id) {
        try {
            console.log(`🔍 [QuestionService] Fetching question ${id}`);
            
            const question = await this.repository.findById(id);
            
            if (!question) {
                throw new Error('Question not found');
            }
            
            console.log(`✅ [QuestionService] Found question ${id}`);
            
            return {
                success: true,
                question: question.toJSON()
            };
            
        } catch (error) {
            console.error(`❌ [QuestionService] Error fetching question ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Get questions for a specific test
     */
    async getQuestionsByTestId(testId) {
        try {
            console.log(`🔍 [QuestionService] Fetching questions for test ${testId}`);
            
            const questions = await this.repository.findByTestId(testId);
            
            console.log(`✅ [QuestionService] Found ${questions.length} questions for test ${testId}`);
            
            return {
                success: true,
                questions: questions.map(q => q.toJSON()),
                count: questions.length,
                testId
            };
            
        } catch (error) {
            console.error(`❌ [QuestionService] Error fetching questions for test ${testId}:`, error);
            throw new Error(`Failed to fetch questions for test: ${error.message}`);
        }
    }
    
    /**
     * Get questions for exam (without answers)
     */
    async getExamQuestions(testId) {
        try {
            console.log(`🔍 [QuestionService] Fetching exam questions for test ${testId}`);
            
            const questions = await this.repository.findByTestId(testId);
            
            console.log(`✅ [QuestionService] Found ${questions.length} exam questions`);
            
            return {
                success: true,
                questions: questions.map(q => q.toExamFormat()), // No answers
                count: questions.length,
                testId
            };
            
        } catch (error) {
            console.error(`❌ [QuestionService] Error fetching exam questions:`, error);
            throw new Error(`Failed to fetch exam questions: ${error.message}`);
        }
    }
    
    /**
     * Create new question
     */
    async createQuestion(questionData) {
        try {
            console.log('➕ [QuestionService] Creating new question');
            
            // Create Question object from request data
            const question = Question.fromRequest(questionData);
            
            // Get next question number
            if (!question.questionNumber || question.questionNumber === 0) {
                question.questionNumber = await this.repository.getNextQuestionNumber(question.testId);
            }
            
            // Validate
            const validation = question.validate();
            if (!validation.isValid) {
                console.error('❌ [QuestionService] Validation failed:', validation.errors);
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Save to database
            const savedQuestion = await this.repository.create(question);
            
            console.log(`✅ [QuestionService] Question created with ID: ${savedQuestion.id}`);
            
            return {
                success: true,
                question: savedQuestion.toJSON(),
                message: 'Question created successfully'
            };
            
        } catch (error) {
            console.error('❌ [QuestionService] Error creating question:', error);
            throw error;
        }
    }
    
    /**
     * Update existing question
     */
    async updateQuestion(id, questionData) {
        try {
            console.log(`✏️ [QuestionService] Updating question ${id}`);
            
            // Check if question exists
            const existing = await this.repository.findById(id);
            if (!existing) {
                throw new Error('Question not found');
            }
            
            // Update fields
            if (questionData.questionText) existing.text = questionData.questionText;
            if (questionData.options) existing.options = questionData.options;
            if (questionData.correctAnswer) existing.correctAnswer = questionData.correctAnswer;
            if (questionData.section) existing.section = questionData.section;
            if (questionData.topic) existing.topic = questionData.topic;
            if (questionData.difficulty) existing.difficulty = questionData.difficulty;
            if (questionData.marks !== undefined) existing.marks = questionData.marks;
            if (questionData.negativeMarks !== undefined) existing.negativeMarks = questionData.negativeMarks;
            
            // Validate
            const validation = existing.validate();
            if (!validation.isValid) {
                console.error('❌ [QuestionService] Validation failed:', validation.errors);
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Save
            await this.repository.update(id, existing);
            
            console.log(`✅ [QuestionService] Question ${id} updated`);
            
            return {
                success: true,
                question: existing.toJSON(),
                message: 'Question updated successfully'
            };
            
        } catch (error) {
            console.error(`❌ [QuestionService] Error updating question ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Delete question
     */
    async deleteQuestion(id) {
        try {
            console.log(`🗑️ [QuestionService] Deleting question ${id}`);
            
            // Check if question exists
            const existing = await this.repository.findById(id);
            if (!existing) {
                throw new Error('Question not found');
            }
            
            // Delete
            await this.repository.delete(id);
            
            console.log(`✅ [QuestionService] Question ${id} deleted`);
            
            return {
                success: true,
                message: 'Question deleted successfully'
            };
            
        } catch (error) {
            console.error(`❌ [QuestionService] Error deleting question ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Check student answer
     */
    async checkAnswer(questionId, studentAnswer) {
        try {
            const question = await this.repository.findById(questionId);
            
            if (!question) {
                throw new Error('Question not found');
            }
            
            const isCorrect = question.checkAnswer(studentAnswer);
            const marks = question.getMarks(studentAnswer);
            
            return {
                success: true,
                isCorrect,
                marks,
                correctAnswer: isCorrect ? null : question.correctAnswer // Show only if wrong
            };
            
        } catch (error) {
            console.error(`❌ [QuestionService] Error checking answer:`, error);
            throw error;
        }
    }
    
    /**
     * Bulk import questions
     */
    async bulkImport(questionsData, testId) {
        try {
            console.log(`📥 [QuestionService] Bulk importing ${questionsData.length} questions`);
            
            const questions = [];
            const errors = [];
            
            // Validate all questions first
            for (let i = 0; i < questionsData.length; i++) {
                try {
                    const question = Question.fromRequest({
                        ...questionsData[i],
                        testId,
                        questionNumber: i + 1
                    });
                    
                    const validation = question.validate();
                    if (!validation.isValid) {
                        errors.push({
                            index: i + 1,
                            errors: validation.errors
                        });
                    } else {
                        questions.push(question);
                    }
                } catch (error) {
                    errors.push({
                        index: i + 1,
                        errors: [error.message]
                    });
                }
            }
            
            // If any errors, don't import
            if (errors.length > 0) {
                throw new Error(`Validation failed for ${errors.length} questions`);
            }
            
            // Import all questions
            const imported = await this.repository.bulkCreate(questions);
            
            console.log(`✅ [QuestionService] Successfully imported ${imported.length} questions`);
            
            return {
                success: true,
                imported: imported.length,
                questions: imported.map(q => q.toJSON()),
                message: `Successfully imported ${imported.length} questions`
            };
            
        } catch (error) {
            console.error('❌ [QuestionService] Error during bulk import:', error);
            throw error;
        }
    }
    
    /**
     * Get question statistics
     */
    async getStatistics(filters = {}) {
        try {
            const total = await this.repository.count(filters);
            
            const byDifficulty = {
                Easy: await this.repository.count({ ...filters, difficulty: 'Easy' }),
                Medium: await this.repository.count({ ...filters, difficulty: 'Medium' }),
                Hard: await this.repository.count({ ...filters, difficulty: 'Hard' })
            };
            
            const bySection = {
                Physics: await this.repository.count({ ...filters, section: 'Physics' }),
                Chemistry: await this.repository.count({ ...filters, section: 'Chemistry' }),
                Mathematics: await this.repository.count({ ...filters, section: 'Mathematics' })
            };
            
            return {
                success: true,
                statistics: {
                    total,
                    byDifficulty,
                    bySection
                }
            };
            
        } catch (error) {
            console.error('❌ [QuestionService] Error getting statistics:', error);
            throw error;
        }
    }
}

export default QuestionService;
