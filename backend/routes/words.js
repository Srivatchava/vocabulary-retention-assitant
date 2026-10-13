import express from 'express';
import { GoogleGenAI } from '@google/genai';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// POST /api/words/preview — Call AI to resolve meaning + category. Does NOT save to DB.
router.post('/preview', authenticate, async (req, res) => {
  try {
    const { word_text, context } = req.body;
    const userId = req.user.id;

    if (!word_text || !word_text.trim()) {
      return res.status(400).json({ error: 'word_text is required' });
    }

    // Fetch user's existing categories to help AI pick the right one
    const [categories] = await db.query(
      'SELECT id, name FROM Category WHERE user_id = ?',
      [userId]
    );
    const categoryNames = categories.map((c) => c.name);

    // Build AI prompt
    const contextNote = context
      ? `The user encountered this word in the following context: "${context}"`
      : 'No additional context was provided.';

    const prompt = `You are a vocabulary assistant. A user has encountered the word "${word_text}".
${contextNote}

Your task:
1. Determine the most appropriate meaning of "${word_text}" given the context (if provided). Be precise and concise — 1-2 sentences max.
2. Assign it to one of the user's existing categories if a good match exists, or suggest a concise new category name (1-3 words) if none fit.

Existing categories: ${categoryNames.length > 0 ? categoryNames.join(', ') : 'None yet'}.

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "meaning": "<concise meaning of the word in the given context>",
  "category": "<best matching existing category name OR a new suggested category name>"
}`;

    // Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });

    const rawText = response.text.trim();

    // Strip markdown code fences if present
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    let aiResult;
    try {
      aiResult = JSON.parse(jsonText);
    } catch {
      console.error('Gemini response parse error:', rawText);
      return res.status(502).json({ error: 'AI returned an unexpected response. Please try again.' });
    }

    // Return AI suggestion — no DB write
    res.json({
      word_text: word_text.trim(),
      context: context?.trim() || null,
      meaning: aiResult.meaning,
      category: aiResult.category,
    });
  } catch (error) {
    console.error('Preview word error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/words/confirm — Save a word with user-confirmed meaning + category to DB.
router.post('/confirm', authenticate, async (req, res) => {
  try {
    const { word_text, context, meaning, category } = req.body;
    const userId = req.user.id;

    if (!word_text?.trim() || !meaning?.trim() || !category?.trim()) {
      return res.status(400).json({ error: 'word_text, meaning, and category are required' });
    }

    // Fetch existing categories to find or create
    const [categories] = await db.query(
      'SELECT id, name FROM Category WHERE user_id = ?',
      [userId]
    );

    const existingCategory = categories.find(
      (c) => c.name.toLowerCase() === category.trim().toLowerCase()
    );

    let categoryId;
    if (existingCategory) {
      categoryId = existingCategory.id;
    } else {
      const [result] = await db.query(
        'INSERT INTO Category (user_id, name, created_at) VALUES (?, ?, NOW())',
        [userId, category.trim()]
      );
      categoryId = result.insertId;
    }

    // Insert confirmed word
    const today = new Date().toISOString().split('T')[0];
    const [wordResult] = await db.query(
      `INSERT INTO Word (user_id, category_id, word_text, context, meaning, familiarity_level, times_practiced, times_forgotten, next_review_date, created_at)
       VALUES (?, ?, ?, ?, ?, 'new', 0, 0, ?, NOW())`,
      [userId, categoryId, word_text.trim(), context?.trim() || null, meaning.trim(), today]
    );

    res.status(201).json({
      word: {
        id: wordResult.insertId,
        word_text: word_text.trim(),
        context: context?.trim() || null,
        meaning: meaning.trim(),
        category: category.trim(),
        category_id: categoryId,
        familiarity_level: 'new',
        times_practiced: 0,
        times_forgotten: 0,
        next_review_date: today,
      },
    });
  } catch (error) {
    console.error('Confirm word error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/words — Get all words for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [words] = await db.query(
      `SELECT w.id, w.word_text, w.context, w.meaning, w.familiarity_level,
              w.times_practiced, w.times_forgotten, w.next_review_date, w.last_practiced_date, w.created_at,
              c.id AS category_id, c.name AS category
       FROM Word w
       LEFT JOIN Category c ON w.category_id = c.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );
    // console.log(words);

    res.json({ words });
  } catch (error) {
    console.error('Get words error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/words/:id/rate — Rate a word (got it or still learning) using Adaptive Leitner System
router.patch('/:id/rate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body; // 'got_it' or 'still_learning'
    const userId = req.user.id;

    if (!rating || !['got_it', 'still_learning'].includes(rating)) {
      return res.status(400).json({ error: 'rating must be "got_it" or "still_learning"' });
    }

    // Fetch the word to verify ownership
    const [words] = await db.query(
      'SELECT * FROM Word WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (words.length === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }

    const word = words[0];

    const INTERVALS = {
      new: 1,
      learning: 3,
      familiar: 7,
      mastered: 21,
    };

    let newFamiliarity = word.familiarity_level;
    let intervalDays = 1;
    const newTimesPracticed = (word.times_practiced || 0) + 1;
    let newTimesForgotten = word.times_forgotten || 0;

    // Adaptive Leitner state transitions:
    // Case A: got_it (Success)
    //   new -> learning (+3 days)
    //   learning -> familiar (+7 days)
    //   familiar -> mastered (+21 days)
    //   mastered -> mastered (+21 days)
    // Case B: still_learning (Memory lapse)
    //   mastered/familiar -> learning (+1 day)
    //   learning/new -> new (+1 day)
    if (rating === 'got_it') {
      if (word.familiarity_level === 'new') {
        newFamiliarity = 'learning';
      } else if (word.familiarity_level === 'learning') {
        newFamiliarity = 'familiar';
      } else if (word.familiarity_level === 'familiar') {
        newFamiliarity = 'mastered';
      } else if (word.familiarity_level === 'mastered') {
        newFamiliarity = 'mastered';
      }
      intervalDays = INTERVALS[newFamiliarity] || 21;
    } else {
      newTimesForgotten += 1;
      if (word.familiarity_level === 'mastered' || word.familiarity_level === 'familiar') {
        newFamiliarity = 'learning';
      } else {
        newFamiliarity = 'new';
      }
      intervalDays = 1; // Retest tomorrow
    }

    // Compute next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);
    const nextReviewDate = nextDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    // Update word in DB
    await db.query(
      `UPDATE Word 
       SET times_practiced = ?, 
           times_forgotten = ?, 
           familiarity_level = ?, 
           last_practiced_date = ?, 
           next_review_date = ? 
       WHERE id = ? AND user_id = ?`,
      [newTimesPracticed, newTimesForgotten, newFamiliarity, today, nextReviewDate, id, userId]
    );

    res.json({
      word: {
        id: Number(id),
        times_practiced: newTimesPracticed,
        times_forgotten: newTimesForgotten,
        familiarity_level: newFamiliarity,
        last_practiced_date: today,
        next_review_date: nextReviewDate,
      },
    });
  } catch (error) {
    console.error('Rate word error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
