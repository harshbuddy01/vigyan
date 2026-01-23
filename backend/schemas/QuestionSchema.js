// Mongoose Schema for Questions
// Replaces SQL questions table with MongoDB collection

import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema(
    {
        testId: {
            type: String,
            required: [true, 'Test ID is required'],
            index: true
        },
        questionNumber: {
            type: Number,
            default: 0
        },
        questionText: {
            type: String,
            required: [true, 'Question text is required'],
            minlength: [5, 'Question text must be at least 5 characters']
        },
        options: {
            type: [String],
            required: [true, 'Options are required'],
            validate: {
                validator: function(v) {
                    return Array.isArray(v) && v.length >= 2 && v.length <= 6;
                },
                message: 'Question must have 2-6 options'
            }
        },
        correctAnswer: {
            type: String,
            required: [true, 'Correct answer is required']
        },
        section: {
            type: String,
            required: true,
            enum: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General'],
            default: 'Physics',
            index: true
        },
        topic: {
            type: String,
            default: 'General'
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Medium',
            index: true
        },
        marksPositive: {
            type: Number,
            default: 4,
            min: [1, 'Marks must be at least 1'],
            max: [10, 'Marks cannot exceed 10']
        },
        marksNegative: {
            type: Number,
            default: -1,
            max: [0, 'Negative marks should be negative or zero']
        },
        type: {
            type: String,
            enum: ['MCQ', 'Numerical', 'TrueFalse'],
            default: 'MCQ'
        }
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
        collection: 'questions'
    }
);

// Indexes for better query performance
QuestionSchema.index({ testId: 1, questionNumber: 1 });
QuestionSchema.index({ section: 1, difficulty: 1 });
QuestionSchema.index({ createdAt: -1 });

// Virtual for backward compatibility with frontend
QuestionSchema.virtual('id').get(function() {
    return this._id.toString();
});

// Ensure virtuals are included in JSON
QuestionSchema.set('toJSON', { virtuals: true });
QuestionSchema.set('toObject', { virtuals: true });

// Create and export model
const QuestionModel = mongoose.model('Question', QuestionSchema);

export default QuestionModel;