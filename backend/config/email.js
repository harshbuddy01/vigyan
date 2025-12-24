import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

/**
 * Email Configuration for IIN Platform
 * Sends notifications to admin when feedback is submitted
 */

// Create transporter
export const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change to any SMTP service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD, // App password (not regular password)
  },
});

/**
 * Send Feedback Notification Email to Admin
 * @param {Object} feedbackData - Feedback details
 */
export const sendFeedbackEmail = async (feedbackData) => {
  try {
    const { email, rollNumber, testId, ratings, comment, feedbackId } = feedbackData;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Admin email
      subject: `🆕 New Feedback Received - ${testId.toUpperCase()} Series`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px 20px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 12px; background: #f8fafc; border-radius: 6px; }
            .info-label { font-weight: 700; color: #334155; }
            .info-value { color: #64748b; }
            .ratings { margin: 20px 0; }
            .rating-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .stars { color: #fbbf24; }
            .comment-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 6px; }
            .footer { text-align: center; padding: 20px; background: #f8fafc; color: #64748b; font-size: 12px; }
            .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 New Feedback Submission</h1>
              <p style="margin: 5px 0 0; opacity: 0.9;">IIN.edu Admin Panel</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1e293b; margin-top: 0;">User Information</h2>
              
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${email}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">Roll Number:</span>
                <span class="info-value">${rollNumber}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">Test Series:</span>
                <span class="info-value">${testId.toUpperCase()}</span>
              </div>
              
              <h2 style="color: #1e293b; margin-top: 30px;">Ratings</h2>
              <div class="ratings">
                <div class="rating-item">
                  <span>Login Experience</span>
                  <span class="stars">${'★'.repeat(ratings.login)}${'☆'.repeat(5 - ratings.login)}</span>
                </div>
                <div class="rating-item">
                  <span>Interface Design</span>
                  <span class="stars">${'★'.repeat(ratings.interface)}${'☆'.repeat(5 - ratings.interface)}</span>
                </div>
                <div class="rating-item">
                  <span>Question Quality</span>
                  <span class="stars">${'★'.repeat(ratings.quality)}${'☆'.repeat(5 - ratings.quality)}</span>
                </div>
                <div class="rating-item" style="border-bottom: none;">
                  <span>Server Performance</span>
                  <span class="stars">${'★'.repeat(ratings.server)}${'☆'.repeat(5 - ratings.server)}</span>
                </div>
              </div>
              
              <h2 style="color: #1e293b; margin-top: 30px;">Comments</h2>
              <div class="comment-box">
                <p style="margin: 0; color: #334155; line-height: 1.6;">${comment}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.ADMIN_PANEL_URL || 'http://localhost:3000'}/admin/feedback/${feedbackId}" class="btn">
                  View in Admin Panel
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>IIN.edu Platform - Feedback System</p>
              <p style="margin: 5px 0 0;">This is an automated notification. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Feedback email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send Confirmation Email to User
 * @param {String} userEmail - User's email address
 */
export const sendUserConfirmation = async (userEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '✅ Feedback Received - IIN.edu',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; text-align: center; color: #334155; }
            .icon { font-size: 48px; margin-bottom: 15px; }
            .footer { padding: 20px; background: #f8fafc; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Thank You!</h1>
            </div>
            <div class="content">
              <div class="icon">✅</div>
              <h2 style="color: #1e293b;">Feedback Received</h2>
              <p style="line-height: 1.6;">
                Thank you for taking the time to share your feedback with us. 
                Your input helps us improve the IIN.edu platform.
              </p>
              <p style="line-height: 1.6; margin-top: 20px;">
                Our team will review your feedback and take necessary actions.
              </p>
            </div>
            <div class="footer">
              <p>IIN.edu - Strategic Vanguard</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent to user:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ User confirmation email failed:', error);
    return { success: false, error: error.message };
  }
};

export default transporter;
