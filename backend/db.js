import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();
import mysql2Timeout from 'mysql2-timeout-additions';

// console.log({
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// })
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  connectTimeout: 60000,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: {
    ca: fs.readFileSync(process.env.CA_PATH),
    rejectUnauthorized: true,
  },
});

// Query timeout: 30 seconds
mysql2Timeout.addTimeoutToPromisePool({
  pool: db,
  seconds: 120,
});

try {
  const connection = await db.getConnection();
  console.log('✅ Connected to MySQL database');
  connection.release();
} catch (error) {
  // console.error('❌ Database connection failed:', error.message);
  console.error('Database connection failed:', error.code);
  console.error(error.message);
}

// try {
//   const [rows] = await db.query('SELECT @@lower_case_table_names;');
//   console.log('Pool connected successfully:', rows);
// } catch (error) {
//   console.error('Pool connection failed:', error.code);
//   console.error(error.message);
// }

// Ensure index exists for spaced repetition queries
db.query(
  `CREATE INDEX IF NOT EXISTS idx_word_due_date ON word (user_id, next_review_date)`
).catch((err) => {
  // Gracefully ignore if index already exists
});

export default db;
