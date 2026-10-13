import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool(process.env.DATABASE_URL);

// Ensure index exists for spaced repetition queries
db.query(
  `CREATE INDEX IF NOT EXISTS idx_word_due_date ON Word (user_id, next_review_date)`
).catch((err) => {
  // Gracefully ignore if index already exists
});

export default db;
