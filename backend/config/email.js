import sgMail from '@sendgrid/mail';
import { config } from 'dotenv';

config();

/**
 * Email Configuration for IIN Platform using SendGrid
 * Sends roll numbers and notifications to users
 * 
 * Migrated from Brevo to SendGrid for better Railway compatibility
 */

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = process.env.SENDGRID_SENDER_EMAIL || process.env.ADMIN_EMAIL || 'noreply@iin.edu';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized successfully');
} else {
  console.warn('⚠️  SENDGRID_API_KEY not found in environment variables');
  console.warn('⚠️  Emails will not be sent until API key is configured');
}

/**
 * Send Roll Number to User
 * @param {String} userEmail - User's email address
 * @param {String} rollNumber - Generated roll number
 * @param {String} userName - User's name (optional)
 * @param {String} testName - Test/Exam name (optional)
 */
export const sendRollNumberEmail = async (userEmail, rollNumber, userName = 'Student', testName = 'IIN.edu Platform') => {
  try {
    if (!SENDGRID_API_KEY) {
      console.warn('⚠️  SendGrid not configured, skipping email');
      return { success: false, error: 'SendGrid API key not configured' };
    }

    const msg = {
      to: userEmail,
      from: {
        email: SENDER_EMAIL,
        name: 'IIN.edu Platform'
      },
      subject: `🎓 Your Roll Number - ${testName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f4f6f9; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
            .header p { margin: 8px 0 0; opacity: 0.95; font-size: 16px; }
            .content { padding: 40px 30px; }
            .greeting { color: #1e293b; font-size: 20px; font-weight: 600; margin-bottom: 16px; }
            .intro-text { color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .roll-number-box { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 3px solid #3b82f6; border-radius: 16px; padding: 40px 20px; margin: 30px 0; text-align: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1); }
            .roll-label { margin: 0 0 12px 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
            .roll-number { font-size: 42px; font-weight: 800; color: #1e40af; letter-spacing: 3px; margin: 12px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.05); }
            .roll-note { margin: 12px 0 0; color: #64748b; font-size: 14px; font-weight: 500; }
            .info-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 24px; margin: 30px 0; border-radius: 8px; }
            .info-box h3 { color: #1e293b; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; }
            .info-box ul { margin: 0; padding-left: 20px; }
            .info-box li { color: #64748b; line-height: 1.8; margin-bottom: 8px; font-size: 15px; }
            .btn { display: inline-block; background: #3b82f6; color: white !important; padding: 16px 32px; border-radius: 10px; text-decoration: none; margin: 20px 0; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.3s; }
            .btn:hover { background: #2563eb; transform: translateY(-2px); }
            .support-text { color: #94a3b8; margin-top: 30px; font-size: 14px; text-align: center; }
            .support-text a { color: #3b82f6; text-decoration: none; font-weight: 600; }
            .footer { text-align: center; padding: 30px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
            .footer-brand { font-weight: 700; color: #1e293b; font-size: 16px; margin-bottom: 8px; }
            .footer-note { color: #64748b; font-size: 12px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Registration Successful!</h1>
              <p>Welcome to ${testName}</p>
            </div>
            
            <div class="content">
              <div class="greeting">Hello ${userName}! 👋</div>
              <p class="intro-text">
                Congratulations! Your registration has been completed successfully. 
                Below is your unique roll number for accessing the IIN.edu examination platform.
              </p>
              
              <div class="roll-number-box">
                <p class="roll-label">Your Roll Number</p>
                <div class="roll-number">${rollNumber}</div>
                <p class="roll-note">⚠️ Please save this for all future exams</p>
              </div>
              
              <div class="info-box">
                <h3>📋 Important Instructions:</h3>
                <ul>
                  <li><strong>Keep it safe</strong> - You'll need this roll number for all examinations</li>
                  <li><strong>Login access</strong> - Use this to access your personalized test dashboard</li>
                  <li><strong>Proof of registration</strong> - This email confirms your enrollment</li>
                  <li><strong>Security</strong> - Do not share your roll number with anyone</li>
                  <li><strong>Save this email</strong> - Keep it for future reference</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.PLATFORM_URL || 'https://iin-theta.vercel.app'}/signinpage.html" class="btn">
                  🚀 Login to Platform
                </a>
              </div>
              
              <p class="support-text">
                Need help? Contact our support team at 
                <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@iin.edu'}">${process.env.SUPPORT_EMAIL || 'support@iin.edu'}</a>
              </p>
            </div>
            
            <div class="footer">
              <div class="footer-brand">IIN.edu - Strategic Vanguard</div>
              <p class="footer-note">This is an automated email notification. Please do not reply directly to this message.</p>
              <p class="footer-note" style="margin-top: 12px;">© ${new Date().getFullYear()} IIN.edu Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello ${userName}!

Your registration has been completed successfully.

YOUR ROLL NUMBER: ${rollNumber}

Please save this roll number - you will need it for all examinations.

Login to the platform: ${process.env.PLATFORM_URL || 'https://iin-theta.vercel.app'}/signinpage.html

Need help? Contact: ${process.env.SUPPORT_EMAIL || 'support@iin.edu'}

---
IIN.edu Platform
This is an automated email. Please do not reply.
      `,
    };

    await sgMail.send(msg);
    console.log('✅ Roll number email sent to:', userEmail, '| Roll Number:', rollNumber);
    return { success: true, rollNumber };

  } catch (error) {
    console.error('❌ Roll number email failed:', error.message);
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send Feedback Notification Email to Admin
 * @param {Object} feedbackData - Feedback details
 */
export const sendFeedbackEmail = async (feedbackData) => {
  try {
    if (!SENDGRID_API_KEY) {
      console.warn('⚠️  SendGrid not configured, skipping email');
      return { success: false, error: 'SendGrid API key not configured' };
    }

    const { email, rollNumber, testId, ratings, comment, feedbackId } = feedbackData;

    const msg = {
      to: process.env.ADMIN_EMAIL || SENDER_EMAIL,
      from: {
        email: SENDER_EMAIL,
        name: 'IIN.edu Feedback System'
      },
      subject: `🆕 New Feedback - ${testId.toUpperCase()} | Roll: ${rollNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
            .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 26px; }
            .content { padding: 30px 25px; }
            .info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 14px; background: #f8fafc; border-radius: 8px; }
            .info-label { font-weight: 700; color: #334155; font-size: 14px; }
            .info-value { color: #64748b; font-size: 14px; }
            .section-title { color: #1e293b; margin: 30px 0 16px 0; font-size: 18px; font-weight: 600; }
            .ratings { margin: 20px 0; }
            .rating-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; }
            .rating-item:last-child { border-bottom: none; }
            .rating-category { color: #334155; font-weight: 500; font-size: 14px; }
            .stars { color: #fbbf24; font-size: 18px; letter-spacing: 2px; }
            .comment-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .comment-text { margin: 0; color: #334155; line-height: 1.7; font-size: 15px; }
            .footer { text-align: center; padding: 24px 20px; background: #f8fafc; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
            .btn { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 New Feedback Received</h1>
              <p style="margin: 8px 0 0; opacity: 0.9; font-size: 15px;">IIN.edu Admin Panel</p>
            </div>
            
            <div class="content">
              <h2 class="section-title">👤 User Information</h2>
              
              <div class="info-row">
                <span class="info-label">Email Address</span>
                <span class="info-value">${email}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">Roll Number</span>
                <span class="info-value"><strong>${rollNumber}</strong></span>
              </div>
              
              <div class="info-row">
                <span class="info-label">Test Series</span>
                <span class="info-value">${testId.toUpperCase()}</span>
              </div>
              
              <h2 class="section-title">⭐ Performance Ratings</h2>
              <div class="ratings">
                <div class="rating-item">
                  <span class="rating-category">Login Experience</span>
                  <span class="stars">${'★'.repeat(ratings.login)}${'☆'.repeat(5 - ratings.login)}</span>
                </div>
                <div class="rating-item">
                  <span class="rating-category">Interface Design</span>
                  <span class="stars">${'★'.repeat(ratings.interface)}${'☆'.repeat(5 - ratings.interface)}</span>
                </div>
                <div class="rating-item">
                  <span class="rating-category">Question Quality</span>
                  <span class="stars">${'★'.repeat(ratings.quality)}${'☆'.repeat(5 - ratings.quality)}</span>
                </div>
                <div class="rating-item">
                  <span class="rating-category">Server Performance</span>
                  <span class="stars">${'★'.repeat(ratings.server)}${'☆'.repeat(5 - ratings.server)}</span>
                </div>
              </div>
              
              <h2 class="section-title">💬 User Comments</h2>
              <div class="comment-box">
                <p class="comment-text">${comment || 'No comments provided.'}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.ADMIN_PANEL_URL || 'https://iin-theta.vercel.app'}/admin.html" class="btn">
                  📊 View in Admin Panel
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>IIN.edu Platform</strong> - Feedback Management System</p>
              <p style="margin: 8px 0 0;">Automated notification • Do not reply to this email</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
    console.log('✅ Feedback email sent to admin');
    return { success: true };

  } catch (error) {
    console.error('❌ Feedback email failed:', error.message);
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send Confirmation Email to User
 * @param {String} userEmail - User's email address
 */
export const sendUserConfirmation = async (userEmail) => {
  try {
    if (!SENDGRID_API_KEY) {
      console.warn('⚠️  SendGrid not configured, skipping email');
      return { success: false, error: 'SendGrid API key not configured' };
    }

    const msg = {
      to: userEmail,
      from: {
        email: SENDER_EMAIL,
        name: 'IIN.edu Platform'
      },
      subject: '✅ Thank You for Your Feedback - IIN.edu',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 35px 20px; text-align: center; }
            .content { padding: 35px 25px; text-align: center; color: #334155; }
            .icon { font-size: 56px; margin-bottom: 20px; }
            .footer { padding: 24px; background: #f8fafc; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Thank You!</h1>
            </div>
            <div class="content">
              <div class="icon">✅</div>
              <h2 style="color: #1e293b; margin-bottom: 16px;">Feedback Received Successfully</h2>
              <p style="line-height: 1.7; font-size: 15px;">
                Thank you for taking the time to share your valuable feedback with us. 
                Your insights help us continuously improve the IIN.edu platform experience.
              </p>
              <p style="line-height: 1.7; margin-top: 24px; font-size: 15px;">
                Our team will carefully review your feedback and implement improvements 
                based on your suggestions.
              </p>
            </div>
            <div class="footer">
              <p><strong>IIN.edu</strong> - Strategic Vanguard</p>
              <p style="margin: 8px 0 0;">Building excellence in education</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
    console.log('✅ Confirmation email sent to user:', userEmail);
    return { success: true };

  } catch (error) {
    console.error('❌ User confirmation email failed:', error.message);
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

export default sgMail;
