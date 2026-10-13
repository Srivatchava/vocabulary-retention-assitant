import cron from 'node-cron';
import db from '../db.js';
import { sendPracticeReminder } from './emailService.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize cron jobs for the application
 */
export function initializeCronJobs() {
  console.log('Initializing cron jobs...');

  // Every day at 9 AM, send reminders to users who haven't practiced yet
  //   const reminderJob = cron.schedule('0 9 * * *', async () => {
  //     console.log('[CRON] Running daily practice reminders at 9 AM...');
  //     await sendDailyReminders();
  //   });


  const reminderJob = cron.schedule('47 1 * * *', async () => {
    console.log('[CRON] Running daily practice reminders at 9 AM...');
    await sendDailyReminders();
  });

  // For testing: run every minute (comment out in production)
  // const testJob = cron.schedule('* * * * *', async () => {
  //   console.log('[CRON TEST] Running test reminder job...');
  // });

  console.log('✅ Cron jobs initialized successfully');
  return [reminderJob];
}

/**
 * Send reminders to all users who haven't practiced today
 */
async function sendDailyReminders() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all users who haven't completed a session today
    const [users] = await db.query(`
      SELECT DISTINCT u.id, u.email, u.name
      FROM User u
      LEFT JOIN Session s ON u.id = s.user_id AND s.session_date = ?
      WHERE s.id IS NULL OR s.completion_status = false
    `, [today]);

    if (users.length === 0) {
      console.log('[CRON] No users need reminders today.');
      return;
    }

    console.log(`[CRON] Sending reminders to ${users.length} user(s)...`);

    let successCount = 0;
    let failureCount = 0;

    // Send reminder to each user
    for (const user of users) {
      try {
        const result = await sendPracticeReminder(user.email, user.name || 'Friend');
        if (result.success) {
          successCount++;
          // Update reminder table
          await db.query(`
            INSERT INTO Reminder (user_id, reminder_date, reminder_sent, practice_completed)
            VALUES (?, ?, true, false)
            ON DUPLICATE KEY UPDATE reminder_sent = true
          `, [user.id, today]);
        } else {
          failureCount++;
          console.error(`Failed to send reminder to ${user.email}:`, result.error);
        }
      } catch (error) {
        failureCount++;
        console.error(`Error processing user ${user.id}:`, error);
      }
    }

    console.log(
      `[CRON] Reminder job completed. Success: ${successCount}, Failed: ${failureCount}`
    );
  } catch (error) {
    console.error('[CRON] Error in sendDailyReminders:', error);
  }
}

/**
 * Mark practice as completed for a user on a specific date
 * (Call this when user completes a session)
 */
export async function markReminderCompleted(userId, date) {
  try {
    await db.query(`
      UPDATE Reminder
      SET practice_completed = true
      WHERE user_id = ? AND reminder_date = ?
    `, [userId, date]);
    console.log(`Reminder marked as completed for user ${userId} on ${date}`);
  } catch (error) {
    console.error('Error marking reminder as completed:', error);
  }
}

/**
 * Manually trigger reminders (useful for testing)
 */
export async function triggerRemindersNow() {
  console.log('Manually triggering daily reminders...');
  await sendDailyReminders();
}

export default { initializeCronJobs, markReminderCompleted, triggerRemindersNow };
