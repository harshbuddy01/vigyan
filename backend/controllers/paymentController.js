import crypto from "crypto";
import nodemailer from "nodemailer";
import { instance } from "../server.js";
import { Payment } from "../models/payment.js";

export const getApiKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY });
};

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

export const paymentVerification = async (req, res) => {
  try {
    // 1. Log the incoming request to debug (visible in Railway logs)
    console.log("Payment Verification Started:", req.body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

    if (!email) {
      console.error("❌ Email missing in request body");
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // 2. Generate Token
      const examToken = Math.floor(10000000 + Math.random() * 90000000).toString();

      // 3. Save to DB (Wrapped in Try/Catch to prevent crashes)
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
        console.error("❌ Database Save Failed:", dbError);
        // We continue even if DB fails, so we can try to send email/display token
      }

      // 4. Send Email
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false,
            family: 4 // Critical for Railway
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
        console.error("❌ Email Sending Failed:", emailError.message);
        // Don't crash; the user still needs to see the token on screen
      }

      // 5. Success Response
      return res.status(200).json({ success: true, token: examToken });

    } else {
      console.error("❌ Invalid Signature");
      return res.status(400).json({ success: false, message: "Invalid Signature" });
    }

  } catch (error) {
    console.error("❌ Critical Server Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};