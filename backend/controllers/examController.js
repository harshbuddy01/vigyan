import { Payment } from "../models/payment.js";
import Question from "../models/question.js";
import ExamResult from "../models/results.js";

// Fetch only purchased tests for a student
export const startTest = async (req, res) => {
  try {
    const { rollNumber, email } = req.body;
    const normalizedEmail = email.toLowerCase(); 

    const student = await Payment.findOne({ rollNumber, email: normalizedEmail });
    if (!student) return res.status(404).json({ success: false, message: "Invalid Token or Email." });
    
    // Find every testId this student has purchased
    const allPurchases = await Payment.find({ email: normalizedEmail });
    const purchasedTests = allPurchases.map(p => p.testId); 

    res.status(200).json({ success: true, purchasedTests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Submit and Save Exam
export const submitExam = async (req, res) => {
  try {
    const { email, testId, userResponses } = req.body;
    const userRecord = await Payment.findOne({ email: email.toLowerCase() });
    const rollNumber = userRecord ? userRecord.rollNumber : "N/A";

    await ExamResult.create({ 
      email: email.toLowerCase(), 
      rollNumber, 
      testId, 
      answers: userResponses 
    });

    res.status(200).json({ success: true, message: "Exam Saved Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Questions for a specific test
export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ testId: req.query.testId });
    res.status(200).json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};