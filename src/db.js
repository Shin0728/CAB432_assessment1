const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 將資料庫放在專案資料夾
const dbPath = path.join(__dirname, 'videos.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// 建立 uploads table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_number TEXT,
      filename TEXT,
      mimetype TEXT,
      size INTEGER,
      path TEXT,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Table creation failed:', err.message);
    else console.log('Uploads table ready.');
  });
});

module.exports = db;