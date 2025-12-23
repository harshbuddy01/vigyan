import express from "express";
import { config } from "dotenv";
import Razorpay from "razorpay";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

// Route & Middleware Imports
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Razorpay
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY || "dummy_id",
  key_secret: process.env.RAZORPAY_API_SECRET || "dummy_secret",
});

// Import Feedback model (check if already exists to prevent overwrite error)
let Feedback;
try {
  Feedback = mongoose.model('Feedback');
} catch (error) {
  // Model doesn't exist, import it
  const FeedbackModule = await import('./models/Feedback.js');
  Feedback = FeedbackModule.default;
}

// --- VERIFICATION & STATUS ROUTES ---

/**
 * Scenario 1, 2, & 3 Verification Logic
 * Prevents account splitting by checking email/roll number status.
 */
app.post("/api/verify-user-full", async (req, res) => {
  try {
    const { email, rollNumber } = req.body;
    const Payment = mongoose.model("Payment"); 
    const user = await Payment.findOne({ email: email.toLowerCase() });

    if (!user) return res.json({ status: "NEW_USER" }); // Scenario 1: Fresh user
    if (!rollNumber) return res.json({ status: "EXISTING_USER_NEED_ROLL" }); // Scenario 3 Step 1
    
    if (user.rollNumber === rollNumber) return res.json({ status: "VERIFIED" }); // Scenario 3 Step 2
    return res.json({ status: "WRONG_ROLL" }); // Roll Number mismatch
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

/**
 * Header Dashboard Status Logic
 * Fetches user data for the floating right-corner dialogue panel.
 */
app.get("/api/user-status", async (req, res) => {
  try {
    const { email } = req.query;
    const Payment = mongoose.model("Payment");
    const userRecords = await Payment.find({ email: email.toLowerCase() });

    if (userRecords.length > 0) {
      const tests = userRecords.map(r => r.testId.toUpperCase());
      res.json({ 
        email: userRecords[0].email, 
        rollNumber: userRecords[0].rollNumber, 
        tests: tests 
      });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

/**
 * Feedback Submission Endpoint
 * Stores user feedback with ratings for admin panel review
 */
app.post("/api/feedback", async (req, res) => {
  try {
    const { email, rollNumber, testId, ratings, comment } = req.body;

    // Validation
    if (!email || !rollNumber || !testId || !ratings || !comment) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Validate ratings
    const { login, interface: interfaceRating, quality, server } = ratings;
    if (!login || !interfaceRating || !quality || !server) {
      return res.status(400).json({ 
        success: false, 
        message: "All rating categories must be provided" 
      });
    }

    // Create feedback entry
    const feedback = new Feedback({
      email: email.toLowerCase(),
      rollNumber,
      testId: testId.toLowerCase(),
      ratings: {
        login,
        interface: interfaceRating,
        quality,
        server
      },
      comment
    });

    await feedback.save();

    res.json({ 
      success: true, 
      message: "Feedback submitted successfully",
      feedbackId: feedback._id
    });

  } catch (error) {
    console.error("Feedback submission error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to submit feedback" 
    });
  }
});

/**
 * Get All Feedback (Admin Panel)
 * Retrieves all feedback for admin dashboard
 */
app.get("/api/admin/feedback", async (req, res) => {
  try {
    const { status, testId, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (testId) query.testId = testId.toLowerCase();

    const feedback = await Feedback.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Feedback.countDocuments(query);

    res.json({
      success: true,
      feedback,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    console.error("Fetch feedback error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch feedback" 
    });
  }
});

/**
 * Update Feedback Status (Admin Panel)
 * Allows admin to mark feedback as reviewed/resolved
 */
app.patch("/api/admin/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: "Feedback not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Feedback status updated",
      feedback 
    });

  } catch (error) {
    console.error("Update feedback error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update feedback" 
    });
  }
});

// Routes
app.use("/api", paymentRoutes);
app.use("/api", adminRoutes);
app.use("/api", examRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on Port ${PORT}`);
});