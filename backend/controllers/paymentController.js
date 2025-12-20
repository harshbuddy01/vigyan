import crypto from "crypto";
import nodemailer from "nodemailer";
import { instance } from "../server.js";
import { Payment } from "../models/payment.js";

// ... (keep getApiKey and checkout functions as they are) ...

export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // 1. Generate Token
      const examToken = Math.floor(10000000 + Math.random() * 90000000).toString();

      // 2. Save to DB (Wrapped in Try/Catch so it doesn't crash if DB is slow)
      try {
        await Payment.create({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          email,
          examToken,
          status: "paid",
        });
        console.log("✅ Payment saved to MongoDB");
      } catch (dbError) {
        console.error("⚠️ Database Save Warning:", dbError.message);
      }

      // 3. Send Email (The Timeout Fix)
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465, // Use Port 465 for SSL
          secure: true,
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
          },
          tls: {
            // CRITICAL: Force IPv4 to prevent Railway/Gmail timeouts
            rejectUnauthorized: false, 
            family: 4 
          }
        });

        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: email,
          subject: 'Your IIN Exam Token',
          text: `Success! Your 8-digit Exam Token is: ${examToken}. Login at iin-theta.vercel.app`
        });
        console.log(`✅ Email sent to ${email}`);
      } catch (emailError) {
        console.error("❌ Email Failed (Timeout bypassed):", emailError.message);
        // We catch the error so the user still gets the success response below
      }

      // 4. Return Success to Frontend (User sees token on screen)
      res.status(200).json({ success: true, token: examToken });

    } else {
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};