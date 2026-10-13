import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Initialize email transporter
// Using Gmail or custom SMTP. Update these environment variables:
// EMAIL_USER, EMAIL_PASS (or use a service like SendGrid)
const transporter = nodemailer.createTransport({
  // pool: true, check the time diff after deloying 
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a practice reminder email to a user
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @returns {Promise} - Result of email sending
 */
export async function sendPracticeReminder(userEmail, userName) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f5f0; border-radius: 8px;">
      <h2 style="color: #2c3e50; text-align: center;">🎯 Time to Practice Your Vocabulary!</h2>
      <p style="color: #34495e; font-size: 16px;">
        Hi <strong>${userName}</strong>,
      </p>
      <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
        You have a new practice session waiting for you! Today's session includes 3 specially-crafted paragraphs with your vocabulary words.
      </p>
      <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
        💡 <strong>Why practice today?</strong>
        <br/>
        Regular practice helps reinforce your learning and maintain your streak. Just 10-15 minutes can make a big difference!
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          Start Practicing Now
        </a>
      </div>
      <p style="color: #7f8c8d; font-size: 14px; text-align: center; margin-top: 20px;">
        You're building strong vocabulary habits. Keep up the great work! 🚀
      </p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: '📚 Vocabulary Practice Reminder — Your Daily Session is Ready!',
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${userEmail}:`, info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send completion congratulation email
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {number} streak - Current streak count
 * @returns {Promise} - Result of email sending
 */
// export async function sendCompletionCongrats(userEmail, userName, streak) {
//   const htmlContent = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
//       <h2 style="color: #fff; text-align: center;">🎉 Great Job Today!</h2>
//       <p style="color: #fff; font-size: 16px;">
//         Hi <strong>${userName}</strong>,
//       </p>
//       <p style="color: #fff; font-size: 16px; line-height: 1.6;">
//         You've completed today's practice session! 🌟
//       </p>
//       <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center;">
//         <p style="color: #fff; font-size: 14px; margin: 0;">Current Streak</p>
//         <p style="color: #fff; font-size: 36px; font-weight: bold; margin: 10px 0;">${streak} 🔥</p>
//       </div>
//       <p style="color: #fff; font-size: 14px; line-height: 1.6;">
//         Keep practicing every day to build your streak and master your vocabulary!
//       </p>
//     </div>
//   `;

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: userEmail,
//     subject: '🎉 Practice Completed — Keep Your Streak Going!',
//     html: htmlContent,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log(`Congratulation email sent to ${userEmail}:`, info.response);
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error(`Error sending congratulation email to ${userEmail}:`, error);
//     return { success: false, error: error.message };
//   }
// }

export default transporter;
