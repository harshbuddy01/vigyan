import express from 'express';
import Student from '../models/Student.js';
import { isMongoDBConnected } from '../config/mongodb.js';

const router = express.Router();

// Email verification endpoint - Creates/finds student
router.post('/verify-user-full', async (req, res) => {
  const { email, rollNumber } = req.body;

  try {
    // Check if MongoDB is connected - Logging only, don't block
    if (!isMongoDBConnected) {
      console.warn('⚠️ Warning: MongoDB variable says disconnected, but attempting query anyway (Mongoose buffering)');
    }

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔵 Verifying user: ${normalizedEmail}`);

    // Set timeout for database operations
    const startTime = Date.now();

    // Check if student exists
    let student = await Student.findOne({ email: normalizedEmail })
      .maxTimeMS(5000) // 5 second max query time
      .lean();

    if (student) {
      // Update last login (fire and forget)
      Student.updateOne(
        { _id: student._id },
        { lastLoginAt: new Date() }
      ).catch(err => console.error('Failed to update lastLoginAt:', err));

      const duration = Date.now() - startTime;
      console.log(`✅ Existing user verified: ${normalizedEmail} (${duration}ms)`);

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

    const duration = Date.now() - startTime;
    console.log(`✅ New student created: ${normalizedEmail} (${duration}ms)`);

    res.json({
      success: true,
      studentId: student._id,
      isNewUser: true,
      email: student.email
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);

    // Handle timeout errors
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.status(504).json({
        error: 'Database timeout',
        message: 'Request took too long. Please try again.'
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate entry',
        message: 'This email is already registered'
      });
    }

    res.status(500).json({
      error: 'Server error during verification',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Enhanced health check for debugging DB connection
router.get('/auth-health', async (req, res) => {
  const mongoose = await import('mongoose');
  const readyState = mongoose.default.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.json({
    status: 'ok',
    mongo_var_connected: isMongoDBConnected,
    mongoose_ready_state: readyState,
    mongoose_state_name: states[readyState] || 'unknown',
    host: mongoose.default.connection.host,
    timestamp: new Date().toISOString()
  });
});

export default router;
