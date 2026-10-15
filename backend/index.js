import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import wordsRoutes from './routes/words.js';
import sessionRoutes from './routes/sessions.js';
import { authenticate } from './middleware/auth.js';
import { initializeCronJobs, triggerRemindersNow } from './services/cronService.js';

import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());//NEED TO UPDATE THIS
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/words', wordsRoutes);
app.use('/api/session', sessionRoutes);

// Protected test route
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'You have accessed a protected route!', user: req.user });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test endpoint to manually trigger reminders (remove in production)
app.post('/api/admin/trigger-reminders', authenticate, async (req, res) => {
  // Optional: add admin check here
  try {
    await triggerRemindersNow();
    res.json({ message: 'Reminders triggered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger reminders' });
  }
});

app.get('/db-ping', async (req, res) => {
  const start = Date.now();

  try {
    await db.query('SELECT 1');

    const latency = Date.now() - start;

    res.json({
      status: 'connected',
      database: 'Aiven MySQL',
      responseTime: `${latency} ms`,
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      error: error.code || error.message,
    });
  }
});

// Initialize cron jobs
// initializeCronJobs();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
