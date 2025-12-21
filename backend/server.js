import express from "express";
import { config } from "dotenv";
import Razorpay from "razorpay";
import cors from "cors";
import mongoose from "mongoose";
import { Resend } from "resend"; // Import Resend SDK
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

// 1. Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// 2. Initialize Razorpay
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY || "dummy_id",
  key_secret: process.env.RAZORPAY_API_SECRET || "dummy_secret",
});

// --- NEW VERIFICATION & STATUS ROUTES ---

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

// --- EXAMPLE RESEND IMPLEMENTATION FOR PAYMENT SUCCESS ---
// You would use this inside your payment verification handler
/*
const sendTokenEmail = async (userEmail, rollNumber) => {
  await resend.emails.send({
    from: 'IIN Education <onboarding@resend.dev>', // Use your verified domain here
    to: userEmail,
    subject: 'Your IIN Exam Token',
    html: `<strong>Your Roll Number is: ${rollNumber}</strong>`
  });
};
*/

app.use("/api", paymentRoutes);
app.use("/api", adminRoutes);
app.use("/api", examRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on Port ${PORT}`);
});