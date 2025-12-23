import crypto from "crypto";
import { instance } from "../server.js";
import { Payment } from "../models/payment.js";
import nodemailer from "nodemailer";

// Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

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

// 3. PAYMENT VERIFICATION (USING GMAIL SMTP)
export const paymentVerification = async (req, res) => {
  console.log("🔹 Verification Started...");
  console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, testId, amount } = req.body;
    
    console.log(`🔹 Email: ${email}`);
    console.log(`🔹 TestId: ${testId}`);
    console.log(`🔹 Amount: ${amount}`);
    
    // Validate required fields
    if (!email) {
      console.log("❌ Email is missing!");
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!testId) {
      console.log("❌ TestId is missing!");
      return res.status(400).json({ success: false, message: "TestId is required" });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("❌ Invalid payment signature!");
      return res.status(400).json({ success: false, message: "Invalid Payment Signature" });
    }

    console.log("✅ Payment signature verified!");

    // Payment verified! Now handle roll number logic
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if student already exists
    let student = await Payment.findOne({ email: normalizedEmail });
    
    let rollNumber;
    let isNewStudent = false;

    if (student) {
      // EXISTING STUDENT - Use their existing roll number
      rollNumber = student.rollNumber;
      
      console.log(`👤 Existing student found: ${normalizedEmail}`);
      
      // Check if they already purchased this test
      if (student.purchasedTests.includes(testId)) {
        console.log(`⚠️ Student already purchased ${testId}`);
        return res.status(400).json({ 
          success: false, 
          message: "You have already purchased this test" 
        });
      }
      
      // Add new test to their purchased tests
      student.purchasedTests.push(testId);
      
      // Add payment to history
      student.payments.push({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        testId,
        amount: amount || 199,
        status: "paid"
      });
      
      await student.save();
      console.log(`✅ Updated existing student: ${normalizedEmail}, Roll: ${rollNumber}`);
      
    } else {
      // NEW STUDENT - Generate new roll number
      rollNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
      isNewStudent = true;
      
      console.log(`🆕 New Student. Generated Roll Number: ${rollNumber}`);
      
      // Create new student record
      student = await Payment.create({
        email: normalizedEmail,
        rollNumber: rollNumber,
        purchasedTests: [testId],
        payments: [{
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          testId,
          amount: amount || 199,
          status: "paid"
        }]
      });
      
      console.log(`✅ Created new student: ${normalizedEmail}, Roll: ${rollNumber}`);
    }

    // Send email using Gmail SMTP
    console.log("📧 Attempting to send email...");
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
                <h1 style="margin: 0; font-size: 28px;">✅ Payment Successful!</h1>
              </div>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="font-size: 16px; color: #333; margin: 0 0 10px 0;">
                ${isNewStudent ? 'Your Roll Number has been generated:' : 'Your existing Roll Number:'}
              </p>
              <div style="background-color: white; padding: 15px; border-radius: 5px; text-align: center; border: 2px dashed #667eea;">
                <p style="margin: 0; font-size: 14px; color: #666;">Roll Number</p>
                <h2 style="margin: 10px 0 0 0; font-size: 36px; color: #667eea; letter-spacing: 3px; font-family: 'Courier New', monospace;">${rollNumber}</h2>
              </div>
            </div>

            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #2e7d32;">
                <strong>✅ Test Purchased:</strong> ${testId.toUpperCase()} Test Series
              </p>
            </div>

            ${!isNewStudent ? `
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #e65100;">
                <strong>📝 Note:</strong> You're using your existing Roll Number. All your purchased tests are linked to this Roll Number.
              </p>
            </div>
            ` : ''}

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ Important:</strong> Save this Roll Number securely. You'll need it to access all your purchased tests.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://iin-theta.vercel.app" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                Access Your Tests 🚀
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                If you have any questions, reply to this email.<br>
                © ${new Date().getFullYear()} IIN Exams. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `;

      // Send email via Gmail SMTP
      const mailOptions = {
        from: process.env.EMAIL_USER || 'IIN Exams <noreply@iin.edu>',
        to: normalizedEmail,
        subject: `🎓 ${isNewStudent ? 'Your Roll Number' : 'Payment Confirmed'} - ${testId.toUpperCase()} Test Series`,
        html: emailHtml
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${normalizedEmail} via Gmail`);
      
    } catch (emailError) {
      console.error("❌ Email Error:", emailError.message);
      console.error("❌ Email Error Stack:", emailError.stack);
      // Don't fail the payment if email fails
    }

    console.log("✅ Sending success response to frontend...");
    // Return success with roll number and purchased tests
    res.status(200).json({ 
      success: true, 
      rollNumber,
      isNewStudent,
      purchasedTests: student.purchasedTests,
      message: isNewStudent 
        ? "Payment successful! Your Roll Number has been sent to your email." 
        : "Payment successful! Test added to your account."
    });
    
  } catch (error) {
    console.error("❌ Payment Verification Error:", error.message);
    console.error("❌ Error Stack:", error.stack);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};