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

// 3. PAYMENT VERIFICATION
export const paymentVerification = async (req, res) => {
  console.log("🔹 Verification Started..."); 
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, testId, amount } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      
      // 1. Check if student exists
      const normalizedEmail = email.toLowerCase().trim();
      let student = await Payment.findOne({ email: normalizedEmail });
      
      let rollNumber;
      let isNewStudent = false;

      if (student) {
        // EXISTING: Reuse Roll Number
        rollNumber = student.rollNumber;
        
        // Add new test if not already present
        if (!student.purchasedTests.includes(testId)) {
             student.purchasedTests.push(testId);
        }

        // Add payment record
        student.payments.push({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            testId: testId || "unknown",
            amount: amount || 0,
            status: "paid"
        });
        await student.save();
        console.log(`✅ Updated User: ${normalizedEmail} (Roll: ${rollNumber})`);

      } else {
        // NEW: Generate Roll Number
        rollNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
        isNewStudent = true;
        
        // Create Record
        await Payment.create({
          email: normalizedEmail,
          rollNumber: rollNumber,
          purchasedTests: [testId],
          payments: [{
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            testId: testId || "unknown",
            amount: amount || 0,
            status: "paid"
          }]
        });
        console.log(`✅ Created User: ${normalizedEmail} (Roll: ${rollNumber})`);
      }

      // 2. Send Email (Using Port 587 - Standard Fix)
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
          subject: isNewStudent ? 'Your IIN Roll Number' : 'Payment Confirmation',
          text: `Success! Your Roll Number is: ${rollNumber}. \n\nLogin at iin-theta.vercel.app`
        });
        
        console.log(`✅ Email sent to ${email}`);
      } catch (emailError) {
        console.error("❌ Email FAILED:", emailError.message);
      }

      // 3. Return Success
      res.status(200).json({ success: true, token: rollNumber });

    } else {
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};