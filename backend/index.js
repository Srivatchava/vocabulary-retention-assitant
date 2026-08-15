import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import wordsRoutes from './routes/words.js';
import sessionRoutes from './routes/sessions.js';
import { authenticate } from './middleware/auth.js';
import { initializeCronJobs, triggerRemindersNow } from './services/cronService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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

// Initialize cron jobs
initializeCronJobs();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
