# Email Reminders Setup Guide

## Quick Start

To enable automated email reminders for your Vocabulary Retention Assistant, follow these steps:

---

## Option 1: Gmail (Recommended for Development)

### Step 1: Generate App-Specific Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer" (or your OS)
5. Copy the 16-character password

### Step 2: Create .env File
Create a `.env` file in the `backend/` directory:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Other required variables
DATABASE_URL=mysql2://root:password@localhost:3306/vocabulary_db
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_key_here
FRONTEND_URL=http://localhost:5173
PORT=5000
```

**Important**: Never commit `.env` to version control!

### Step 3: Test Connection
Restart your backend server and check the logs for:
```
✅ Cron jobs initialized successfully
```

---

## Option 2: SendGrid

### Step 1: Create SendGrid Account
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your email address
3. Go to Settings → API Keys
4. Create a new API Key (Full Access)

### Step 2: Create .env File

```env
# Email Configuration
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxx

# Other variables...
```

### Step 3: Update Email Service
Modify `backend/services/emailService.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

---

## Option 3: Mailgun

### Step 1: Create Mailgun Account
1. Sign up at [mailgun.com](https://mailgun.com)
2. Verify your domain
3. Get your API credentials from Settings

### Step 2: Create .env File

```env
EMAIL_SERVICE=Mailgun
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your_mailgun_api_key

# Other variables...
```

---

## Testing Email Sending

### Method 1: Manual Trigger (Recommended)
```bash
# Start backend server
cd backend
npm run dev

# In another terminal, trigger reminders manually
curl -X POST http://localhost:5000/api/admin/trigger-reminders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "message": "Reminders triggered successfully"
}

# Check backend logs:
# [CRON] Running daily practice reminders at 9 AM...
# [CRON] Sending reminders to X user(s)...
# [CRON] Reminder job completed. Success: X, Failed: 0
```

### Method 2: Check Email
1. Create a test user account
2. Add a few words
3. Wait for the next scheduled time (9 AM) or trigger manually
4. Check your email inbox (or spam folder)

### Method 3: Debug Mode
Add this to the top of `backend/services/cronService.js` for testing:

```javascript
// Test: Run every minute instead of daily at 9 AM
const reminderJob = cron.schedule('* * * * *', async () => {
  console.log('[CRON] Running test reminder job...');
  await sendDailyReminders();
});
```

Remember to remove this after testing!

---

## Verify Email Looks Good

When you receive a practice reminder email, it should have:
- ✅ Professional HTML formatting
- ✅ Clear call-to-action button
- ✅ Your app branding (VocabAI logo/name)
- ✅ Link back to your practice page
- ✅ Encouraging message

---

## Troubleshooting

### "EAUTH: Invalid login" Error
- **Solution**: Double-check your email and password in `.env`
- For Gmail: Make sure you're using an app-specific password, not your regular password
- Test credentials manually: `telnet smtp.gmail.com 587`

### Emails Going to Spam
- **Solution**: Add your email to contacts/whitelist
- Check email headers to see why it was flagged
- For production: Use a proper transactional email service (SendGrid, Mailgun)

### No Emails Sent on Schedule
- **Solution**: Check that backend server is running (cron only works while server is active)
- For production: Use a background job service (Bull, Bee-Queue, AWS SQS)

### "SERVICE not recognized"
- **Solution**: Ensure `EMAIL_SERVICE` matches nodemailer's supported services
- Supported: gmail, sendgrid, mailgun, AWS SES, etc.
- For custom SMTP, modify the transporter config

---

## Production Deployment

For production, consider:

1. **Use a Proper Email Service**
   - SendGrid: $20/month, 40,000 emails/month
   - Mailgun: Pay-as-you-go (~$0.50 per 1000 emails)
   - AWS SES: $0.10 per 1000 emails

2. **Background Job Queue**
   - Replace simple cron with Bull or Bee-Queue
   - Ensures emails send even if server restarts

3. **Email Template Engine**
   - Use Handlebars or EJS for dynamic templates
   - Store templates in database

4. **Monitoring**
   - Track email delivery rates
   - Set up alerts for send failures
   - Log all email activity

5. **Compliance**
   - Add unsubscribe link to emails (CAN-SPAM requirement)
   - Maintain email list hygiene
   - Handle bounces automatically

---

## Example Production Setup

```javascript
// Use Bull for background jobs
import Queue from 'bull';

const emailQueue = new Queue('email', 'redis://localhost:6379');

emailQueue.process(async (job) => {
  const { userEmail, userName } = job.data;
  return await sendPracticeReminder(userEmail, userName);
});

// Schedule job (every day at 9 AM)
emailQueue.add({}, { repeat: { cron: '0 9 * * *' } });
```

---

## FAQ

**Q: Can users customize reminder time?**
A: Not yet. Future enhancement: add user preference endpoint to set preferred reminder time.

**Q: Will emails work on localhost?**
A: Yes! Gmail and other SMTP services work fine with `localhost` for testing.

**Q: Can I send bulk emails?**
A: Yes, but use a proper service. Nodemailer can send to multiple recipients, but SendGrid/Mailgun are better for scale.

**Q: How do I track if emails were opened?**
A: Use SendGrid's built-in tracking or add a pixel tracker in HTML template.

---

## Support

If emails still aren't sending:
1. Check backend logs for detailed error messages
2. Verify `.env` file has all required variables
3. Test SMTP credentials with a simple Node script:

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password',
  },
});

transporter.verify((error, success) => {
  if (error) console.error('ERROR:', error);
  else console.log('✅ SMTP Connection OK');
});
```
