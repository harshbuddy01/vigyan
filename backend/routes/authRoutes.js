import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

// Email verification endpoint - Creates/finds student
router.post('/verify-user-full', async (req, res) => {
  const { email, rollNumber } = req.body;
  
  try {
    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if student exists
    let student = await Student.findOne({ email: normalizedEmail });

    if (student) {
      // Update last login
      student.lastLoginAt = new Date();
      await student.save();

      console.log(`✅ Existing user verified: ${normalizedEmail}`);

      return res.json({
        success: true,
        studentId: student._id,
        isNewUser: false,
        email: student.email
      });
    }

    // Create new student
    student = await Student.create({
      email: normalizedEmail,
      rollNumber: rollNumber || null,
      createdAt: new Date(),
      lastLoginAt: new Date()
    });

    console.log(`✅ New student created: ${normalizedEmail}`);

    res.json({
      success: true,
      studentId: student._id,
      isNewUser: true,
      email: student.email
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({ 
      error: 'Server error during verification',
      message: error.message 
    });
  }
});

export default router;
