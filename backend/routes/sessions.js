import express from 'express';
import { GoogleGenAI } from '@google/genai';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { markReminderCompleted } from '../services/cronService.js';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const WORDS_PER_PARAGRAPH = 4;

// Priority tier for word selection within a category:
// Tier 1: Due words (next_review_date <= CURDATE())
// Tier 2: Unreviewed new words (times_practiced === 0 || familiarity_level === 'new')
// Tier 3: Words closest to their due date (ranked by urgency)
function getWordPriority(w) {
  if (w.is_due) return 1;
  if (w.times_practiced === 0 || w.familiarity_level === 'new') return 2;
  return 3;
}

// Enrich a session row: parse JSON fields + fetch full word objects for words_included
async function enrichSession(session) {
  // console.log(typeof session.paragraphs);

  const paragraphs =
    typeof session.paragraphs === 'string'
      ? JSON.parse(session.paragraphs)
      : session.paragraphs;

  const wordIdArrays =
    typeof session.words_included === 'string'
      ? JSON.parse(session.words_included)
      : session.words_included;

  // Collect all unique word IDs
  const allIds = [...new Set(wordIdArrays.flat())];

  let wordMap = {};
  if (allIds.length > 0) {
    const placeholders = allIds.map(() => '?').join(', ');
    // console.log(placeholders);

    const [rows] = await db.query(
      `SELECT w.id, w.word_text, w.meaning, w.familiarity_level, w.times_practiced, w.times_forgotten, w.next_review_date, c.name AS category
       FROM word w LEFT JOIN category c ON w.category_id = c.id
       WHERE w.id IN (${placeholders})`,
      allIds
    );

    // console.log(rows);
    // const temp = rows.map((r) => [r.id, r]);
    // console.log(temp);


    wordMap = Object.fromEntries(rows.map((r) => [r.id, r]));
    // console.log(wordMap);

  }

  // Replace ID arrays with full word objects
  const wordsIncluded = wordIdArrays.map((ids) =>
    ids.map((id) => wordMap[id]).filter(Boolean)
  );

  // console.log(wordsIncluded);


  return {
    id: session.id,
    session_date: session.session_date,
    completion_status: !!session.completion_status,
    paragraphs,
    words_included: wordsIncluded,
  };
}

// GET /api/session/today — return today's session or null
router.get('/today', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [rows] = await db.query(
      'SELECT * FROM session WHERE user_id = ? AND session_date = ? LIMIT 1',
      [userId, today]
    );
    // console.log(rows);

    if (rows.length === 0) return res.json({ session: null });

    const session = await enrichSession(rows[0]);
    res.json({ session });
  } catch (error) {
    console.error('Get today session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/session/generate — build and save today's practice session using Adaptive Leitner Category-Aware Batching
router.post('/generate', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Guard: don't regenerate if session already exists today
    const [existing] = await db.query(
      'SELECT id FROM session WHERE user_id = ? AND session_date = ? LIMIT 1',
      [userId, today]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Session already generated for today.' });
    }

    // Fetch all user words with category, urgency score, and due status
    // Urgency = (TODAY - next_review_date) + (times_forgotten / (times_practiced + 1) * 5)
    const [allWords] = await db.query(
      `SELECT w.id, w.word_text, w.meaning, w.familiarity_level, w.times_practiced, w.times_forgotten, w.next_review_date,
              w.category_id, c.name AS category,
              (DATEDIFF(CURDATE(), COALESCE(w.next_review_date, CURDATE())) + (w.times_forgotten / (w.times_practiced + 1) * 5)) AS urgency,
              (w.next_review_date <= CURDATE() OR w.next_review_date IS NULL) AS is_due
       FROM word w
       JOIN category c ON w.category_id = c.id
       WHERE w.user_id = ?
       ORDER BY (w.next_review_date <= CURDATE() OR w.next_review_date IS NULL) DESC, urgency DESC`,
      [userId]
    );

    if (allWords.length === 0) {
      return res.status(400).json({
        error: 'Add some words to your vocabulary before generating a practice session.',
      });
    }

    // Group words by category and compute category-level statistics
    const categoryMap = {};
    for (const w of allWords) {
      const catId = w.category_id;
      const isDue = Boolean(w.is_due);
      const urgency = parseFloat(w.urgency) || 0;
      const wordObj = {
        ...w,
        is_due: isDue,
        urgency,
      };

      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          id: catId,
          name: w.category,
          words: [],
          dueWordsCount: 0,
          newWordsCount: 0,
          totalUrgency: 0,
        };
      }

      categoryMap[catId].words.push(wordObj);
      if (isDue) {
        categoryMap[catId].dueWordsCount += 1;
      }
      if (w.times_practiced === 0 || w.familiarity_level === 'new') {
        categoryMap[catId].newWordsCount += 1;
      }
      categoryMap[catId].totalUrgency += urgency;
    }

    // Category-Aware Selection Strategy:
    // 1. Group by category and pick top up to 3 categories with most due words
    // 2. Tiebreakers: unreviewed new words count, total urgency, category size
    const sortedCategories = Object.values(categoryMap).sort((a, b) => {
      if (b.dueWordsCount !== a.dueWordsCount) {
        return b.dueWordsCount - a.dueWordsCount;
      }
      if (b.newWordsCount !== a.newWordsCount) {
        return b.newWordsCount - a.newWordsCount;
      }
      if (b.totalUrgency !== a.totalUrgency) {
        return b.totalUrgency - a.totalUrgency;
      }
      return b.words.length - a.words.length;
    });

    const chosen = sortedCategories.slice(0, 3);

    // Select up to 4 words per category:
    // - Pick due words first (highest urgency)
    // - Backfill with unreviewed 'new' words
    // - Backfill with words closest to their due date (highest urgency)
    const plan = chosen.map((cat) => {
      const sortedWords = [...cat.words].sort((a, b) => {
        const pA = getWordPriority(a);
        const pB = getWordPriority(b);
        if (pA !== pB) return pA - pB;
        return b.urgency - a.urgency;
      });

      return {
        category: cat.name,
        words: sortedWords.slice(0, WORDS_PER_PARAGRAPH),
      };
    });

    // Build prompt — one call for all paragraphs
    const paragraphLines = plan
      .map(
        (p, i) =>
          `Paragraph ${i + 1} — Category "${p.category}": naturally incorporate these words: ${p.words.map((w) => `"${w.word_text}"`).join(', ')}`
      )
      .join('\n');

    const prompt = `You are a vocabulary practice writer. Write ${plan.length} practice paragraph(s) for an adult learner.

Rules:
- Each paragraph must be 4–6 sentences and relate to its category theme.
- Use every listed word naturally in context — do NOT define them explicitly.
- The writing style should be clear, engaging, and educational.
- Each paragraph must contain all its listed words exactly as spelled (case may vary).

${paragraphLines}

Respond ONLY with valid JSON — no markdown, no explanation:
{
  "paragraphs": ["<paragraph 1>", "<paragraph 2>", "<paragraph 3>"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });

    const rawText = response.text.trim();
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    let aiResult;
    try {
      aiResult = JSON.parse(jsonText);
    } catch {
      console.error('Session AI parse error:', rawText);
      return res
        .status(502)
        .json({ error: 'AI returned an unexpected response. Please try again.' });
    }

    const paragraphs = (aiResult.paragraphs || []).slice(0, plan.length);
    while (paragraphs.length < plan.length) paragraphs.push('');

    // Store only word IDs in DB
    const wordsIncludedIds = plan.map((p) => p.words.map((w) => w.id));

    const [result] = await db.query(
      `INSERT INTO session (user_id, session_date, paragraphs, words_included, completion_status, created_at)
       VALUES (?, ?, ?, ?, false, NOW())`,
      [userId, today, JSON.stringify(paragraphs), JSON.stringify(wordsIncludedIds)]
    );

    // Return enriched session (with full word objects for frontend)
    const wordsIncluded = plan.map((p) =>
      p.words.map(({ id, word_text, meaning, familiarity_level, category }) => ({
        id, word_text, meaning, familiarity_level, category,
      }))
    );

    res.status(201).json({
      session: {
        id: result.insertId,
        session_date: today,
        completion_status: false,
        paragraphs,
        words_included: wordsIncluded,
      },
    });
  } catch (error) {
    console.error('Generate session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/session/:id/complete — Mark session as complete and update user streak
router.patch('/:id/complete', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify session exists and belongs to user
    const [sessions] = await db.query(
      'SELECT * FROM session WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessions[0];

    // Mark session as complete
    await db.query(
      'UPDATE session SET completion_status = true WHERE id = ?',
      [id]
    );

    // Check if session was already completed today (don't increment streak twice)
    const wasCompleted = session.completion_status;

    if (!wasCompleted) {
      // Get user's current streak
      const [users] = await db.query(
        'SELECT streak_count FROM user WHERE id = ?',
        [userId]
      );
      const currentStreak = users[0].streak_count || 0;

      // Check if session is from today
      const today = new Date().toISOString().split('T')[0];
      const sessionDate = new Date(session.session_date).toISOString().split('T')[0];

      if (sessionDate === today) {
        // Increment streak
        await db.query(
          'UPDATE user SET streak_count = ? WHERE id = ?',
          [currentStreak + 1, userId]
        );

        // Mark reminder as completed for today
        // await markReminderCompleted(userId, today);
      }
    }

    // Return enriched session
    const enrichedSession = await enrichSession(session);
    res.json({ session: enrichedSession, streak_incremented: !wasCompleted });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/session/history — Get past sessions
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [sessions] = await db.query(
      'SELECT * FROM session WHERE user_id = ? ORDER BY session_date DESC LIMIT 30',
      [userId]
    );

    const enriched = await Promise.all(sessions.map(enrichSession));
    res.json({ sessions: enriched });
  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/session/stats — Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data (streak)
    const [users] = await db.query(
      'SELECT id, email, streak_count, created_at FROM user WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Get word stats by familiarity level
    const [wordStats] = await db.query(
      `SELECT 
        familiarity_level,
        COUNT(*) as count,
        AVG(times_practiced) as avg_practiced,
        AVG(times_forgotten) as avg_forgotten
       FROM word
       WHERE user_id = ?
       GROUP BY familiarity_level`,
      [userId]
    );

    // Convert to object for easier access
    const familiarityStats = {};
    for (const stat of wordStats) {
      familiarityStats[stat.familiarity_level] = {
        count: stat.count,
        avg_practiced: Math.round(stat.avg_practiced || 0),
        avg_forgotten: Math.round(stat.avg_forgotten || 0),
      };
    }

    // Get total word count
    const [totalWords] = await db.query(
      'SELECT COUNT(*) as total FROM word WHERE user_id = ?',
      [userId]
    );

    // Get category stats
    const [categoryStats] = await db.query(
      `SELECT 
        c.name,
        COUNT(w.id) as word_count
       FROM category c
       LEFT JOIN word w ON c.id = w.category_id
       WHERE c.user_id = ?
       GROUP BY c.id, c.name
       ORDER BY word_count DESC`,
      [userId]
    );

    // Get session stats
    const [sessionStats] = await db.query(
      `SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN completion_status = true THEN 1 ELSE 0 END) as completed_sessions,
        ROUND(AVG(CASE WHEN completion_status = true THEN 1 ELSE 0 END) * 100, 2) as completion_rate
       FROM session
       WHERE user_id = ?`,
      [userId]
    );

    // Get last 7 days practice streak data
    const [recentSessions] = await db.query(
      `SELECT 
        session_date,
        completion_status
       FROM session
       WHERE user_id = ?
       AND session_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       ORDER BY session_date DESC`,
      [userId]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        streak_count: user.streak_count || 0,
        account_created: user.created_at,
      },
      words: {
        total: totalWords[0].total || 0,
        by_familiarity: familiarityStats,
      },
      categories: categoryStats.map((c) => ({
        name: c.name,
        word_count: c.word_count || 0,
      })),
      sessions: {
        total: sessionStats[0].total_sessions || 0,
        completed: sessionStats[0].completed_sessions || 0,
        completion_rate: sessionStats[0].completion_rate || 0,
      },
      recent_activity: recentSessions.map((s) => ({
        date: s.session_date,
        completed: !!s.completion_status,
      })),
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
