import crypto from "crypto";
import nodemailer from "nodemailer";
import { instance } from "../server.js";
import { Payment } from "../models/payment.js";

// 1. GET API KEY
export const getApiKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY });
};

// 2. CHECKOUT
export const checkout = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
    };
    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. PAYMENT VERIFICATION (Port 587 Fix)
export const paymentVerification = async (req, res) => {
  console.log("🔹 Verification Started..."); 
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const examToken = Math.floor(10000000 + Math.random() * 90000000).toString();

      try {
        await Payment.create({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          email,
          examToken,
          status: "paid",
        });
        console.log("✅ Payment saved to DB");
      } catch (dbError) {
        console.error("⚠️ DB Save Error:", dbError.message);
      }

      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        await transporter.sendMail({
          from: `"IIN Exams" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: 'Your IIN Exam Token',
          text: `Success! Your 8-digit Exam Token is: ${examToken}. Login at iin-theta.vercel.app`
        });
        
        console.log(`✅ Email sent to ${email}`);
      } catch (emailError) {
        console.error("❌ Email FAILED:", emailError);
      }

      res.status(200).json({ success: true, token: examToken });

    } else {
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};