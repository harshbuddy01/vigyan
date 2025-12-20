import crypto from "crypto";
import nodemailer from "nodemailer";
import { Payment } from "../models/payment.js";
import { instance } from "../server.js";
// backend/controllers/paymentController.js



export const paymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

  // 1. Verify Signature (Standard Razorpay Security)
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // 2. Generate Automatic 8-Digit Token
    const examToken = Math.floor(10000000 + Math.random() * 90000000).toString();

    // 3. Save Payment and Token to MongoDB
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      examToken,
      status: "paid"
    });

    // 4. Send Email to Student
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your IIN Exam Token - Access Granted',
      text: `Success! Your payment was verified. Your 8-digit Exam Token is: ${examToken}. Use this to login at iin-theta.vercel.app/signinpage.html`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
        success: true, 
        message: "Payment Verified & Token Sent", 
        token: examToken 
    });
  } else {
    res.status(400).json({ success: false, message: "Signature Mismatch" });
  }
};