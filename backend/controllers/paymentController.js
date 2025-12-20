import crypto from "crypto";
import nodemailer from "nodemailer";
import { instance } from "../server.js";
import { Payment } from "../models/payment.js";

// STEP 1: Create Razorpay Order
// This MUST be named 'checkout' to match your routes
export const checkout = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100), // Amount in paisa
      currency: "INR",
    };
    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// STEP 2: Verify Payment & Auto-Generate Token
export const paymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // Generate 8-digit token automatically
    const examToken = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Save to Database
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      examToken,
      status: "paid",
    });

    // Send Token via Email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS // Ensure this is your Google App Password
        }
      });

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'IIN Exam Hall: Your 8-Digit Token',
        text: `Payment Successful! Your Exam Token is: ${examToken}. Use this to login at iin-theta.vercel.app`
      });
    } catch (err) {
      console.error("Token generated but email failed:", err);
    }

    res.status(200).json({ success: true, token: examToken });
  } else {
    res.status(400).json({ success: false, message: "Invalid Signature" });
  }
};