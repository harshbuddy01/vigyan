import crypto from "crypto";
import { instance } from "../server.js";
import { pool } from "../config/mysql.js";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('⚠️ SENDGRID_API_KEY not set - email functionality disabled');
}

// Helper function to safely extract first name from email
const extractFirstName = (email) => {
  try {
    if (!email || typeof email !== 'string') return 'User';
    
    const emailParts = email.split('@');
    if (emailParts.length < 2) return 'User';
    
    const username = emailParts[0];
    const nameParts = username.split('.');
    const firstName = nameParts[0] || 'User';
    
    // Capitalize first letter
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  } catch (error) {
    console.error('Error extracting first name:', error.message);
    return 'User';
  }
};

// 1. GET API KEY
export const getApiKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY });
};

// 2. CHECKOUT
export const checkout = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid amount is required" 
      });
    }
    
    const options = {
      amount: Number(amount * 100),
      currency: "INR",
    };
    
    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. PAYMENT VERIFICATION (USING MYSQL + SENDGRID)
export const paymentVerification = async (req, res) => {
  console.log("🔹 Verification Started...");
  console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, testId, amount } = req.body;
    
    console.log(`🔹 Email: ${email}`);
    console.log(`🔹 TestId: ${testId}`);
    console.log(`🔹 Amount: ${amount}`);
    
    // Validate required fields
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log("❌ Invalid or missing email!");
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    if (!testId || typeof testId !== 'string') {
      console.log("❌ TestId is missing or invalid!");
      return res.status(400).json({ success: false, message: "Valid TestId is required" });
    }
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log("❌ Missing payment verification parameters!");
      return res.status(400).json({ success: false, message: "Missing payment verification data" });
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
    
    // Check if student already exists in MySQL
    const [existingStudents] = await pool.query(
      "SELECT * FROM students_payments WHERE email = ?",
      [normalizedEmail]
    );
    
    let rollNumber;
    let isNewStudent = false;
    let purchasedTests = [];

    if (existingStudents.length > 0) {
      // EXISTING STUDENT - Use their existing roll number
      const student = existingStudents[0];
      rollNumber = student.roll_number;
      
      console.log(`👤 Existing student found: ${normalizedEmail}`);
      
      // Check if they already purchased this test
      const [existingPurchase] = await pool.query(
        "SELECT * FROM purchased_tests WHERE email = ? AND test_id = ?",
        [normalizedEmail, testId]
      );
      
      if (existingPurchase.length > 0) {
        console.log(`⚠️ Student already purchased ${testId}`);
        return res.status(400).json({ 
          success: false, 
          message: "You have already purchased this test" 
        });
      }
      
      // Add new test to their purchased tests
      await pool.query(
        "INSERT INTO purchased_tests (email, test_id) VALUES (?, ?)",
        [normalizedEmail, testId]
      );
      
      // Add payment to history
      await pool.query(
        `INSERT INTO payment_transactions 
         (email, razorpay_order_id, razorpay_payment_id, razorpay_signature, test_id, amount, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'paid')`,
        [normalizedEmail, razorpay_order_id, razorpay_payment_id, razorpay_signature, testId, amount || 199]
      );
      
      // Get all purchased tests
      const [tests] = await pool.query(
        "SELECT test_id FROM purchased_tests WHERE email = ?",
        [normalizedEmail]
      );
      purchasedTests = tests.map(t => t.test_id);
      
      console.log(`✅ Updated existing student: ${normalizedEmail}, Roll: ${rollNumber}`);
      
    } else {
      // NEW STUDENT - Generate new roll number
      rollNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
      isNewStudent = true;
      
      console.log(`🆕 New Student. Generated Roll Number: ${rollNumber}`);
      
      // Create new student record
      await pool.query(
        "INSERT INTO students_payments (email, roll_number) VALUES (?, ?)",
        [normalizedEmail, rollNumber]
      );
      
      // Add purchased test
      await pool.query(
        "INSERT INTO purchased_tests (email, test_id) VALUES (?, ?)",
        [normalizedEmail, testId]
      );
      
      // Add payment transaction
      await pool.query(
        `INSERT INTO payment_transactions 
         (email, razorpay_order_id, razorpay_payment_id, razorpay_signature, test_id, amount, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'paid')`,
        [normalizedEmail, razorpay_order_id, razorpay_payment_id, razorpay_signature, testId, amount || 199]
      );
      
      purchasedTests = [testId];
      
      console.log(`✅ Created new student: ${normalizedEmail}, Roll: ${rollNumber}`);
    }

    // Send email using SendGrid - PREMIUM TEMPLATE
    console.log("📧 Attempting to send email via SendGrid...");
    
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_SENDER_EMAIL) {
      try {
        // ✅ Safe first name extraction
        const firstName = extractFirstName(normalizedEmail);
        
        // Get current date
        const currentDate = new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        // Test series full name
        const testSeriesName = testId.toUpperCase() + " Test Series";
        
        const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmed - IIN.EDU</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 0;">
        
        <!-- Header with Green Bar -->
        <div style="background-color: #059669; height: 8px;"></div>
        
        <!-- Logo & Date Section -->
        <div style="padding: 40px 60px 20px; border-bottom: 2px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div style="font-size: 28px; font-weight: 900; color: #1f2937; letter-spacing: -0.5px;">
                        IIN<span style="color: #059669;">.EDU</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">
                        EXAMINATION CELL
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                        DATE:
                    </div>
                    <div style="font-size: 13px; font-weight: 700; color: #1f2937; margin-top: 2px;">
                        ${currentDate}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 50px 60px;">
            
            <h1 style="font-size: 22px; font-weight: 700; color: #1f2937; margin: 0 0 30px 0; letter-spacing: -0.3px;">
                Registration Confirmed.
            </h1>
            
            <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 8px 0;">
                Dear <strong style="color: #1f2937;">${firstName}</strong>,
            </p>
            
            <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 10px 0;">
                You have been successfully enrolled in the <strong style="color: #1f2937;">${testSeriesName}</strong>.
            </p>
            
            <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 40px 0;">
                The competent authority has generated your unique examination credentials.
            </p>
            
            <!-- Roll Number Box -->
            <div style="background: linear-gradient(to bottom, #fffbeb 0%, #fef3c7 100%); border: 2px solid #f59e0b; border-radius: 8px; padding: 35px 30px; text-align: center; margin-bottom: 35px;">
                <div style="font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px;">
                    YOUR ROLL NUMBER
                </div>
                <div style="font-size: 38px; font-weight: 700; color: #1f2937; font-family: 'Courier New', monospace; letter-spacing: 4px; margin-bottom: 20px;">
                    ${rollNumber}
                </div>
                <div style="font-size: 11px; font-weight: 600; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">
                    ★ DO NOT SHARE THIS CREDENTIAL
                </div>
            </div>
            
            <!-- Important Notice -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 18px 22px; margin-bottom: 40px;">
                <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.6;">
                    <strong style="font-weight: 700;">⚠️ Important:</strong> Save this Roll Number securely. You will need it to access all your purchased tests.
                </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 45px 0 20px;">
                <a href="https://iin-theta.vercel.app" style="display: inline-block; background-color: #1f2937; color: white; padding: 16px 50px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase;">
                    PROCEED TO DASHBOARD →
                </a>
            </div>
            
        </div>
        
        <!-- Footer -->
        <div style="background-color: #1f2937; padding: 35px 60px; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                If you have any questions, reply to this email.
            </p>
            <p style="margin: 0; font-size: 11px; color: #6b7280;">
                © ${new Date().getFullYear()} IIN Exams. All rights reserved.
            </p>
        </div>
        
    </div>
</body>
</html>
        `;

        // Send email via SendGrid
        const msg = {
          to: normalizedEmail,
          from: process.env.SENDGRID_SENDER_EMAIL,
          subject: `Registration Confirmed - ${testSeriesName}`,
          html: emailHtml,
        };

        await sgMail.send(msg);
        console.log(`✅ Email sent successfully to ${normalizedEmail} via SendGrid`);
        
      } catch (emailError) {
        console.error("❌ SendGrid Email Error:", emailError.message);
        if (emailError.response) {
          console.error("❌ SendGrid Response Body:", JSON.stringify(emailError.response.body));
        }
        // Don't fail the payment if email fails
      }
    } else {
      console.warn('⚠️ Email sending skipped - SendGrid credentials not configured');
    }

    console.log("✅ Sending success response to frontend...");
    // Return success with roll number and purchased tests
    res.status(200).json({ 
      success: true, 
      rollNumber,
      isNewStudent,
      purchasedTests,
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