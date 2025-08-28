// responsible for the main interactions with the database.
// uploadRepository.js
// 負責跟 uploads table 互動

// const pool = require('../db_1');

// // 取得全部上傳紀錄
// exports.getAll = async () => {
//   const conn = await pool.getConnection();
//   try {
//     const rows = await conn.query('SELECT * FROM uploads ORDER BY upload_date DESC');
//     return rows;
//   } finally {
//     conn.release();
//   }
// };

// // 依 ID 取得單筆紀錄
// exports.getById = async (id) => {
//   const conn = await pool.getConnection();
//   try {
//     const rows = await conn.query('SELECT * FROM uploads WHERE id = ?', [id]);
//     return rows[0];
//   } finally {
//     conn.release();
//   }
// };

// // 建立一筆上傳紀錄
// exports.create = async (section_number, filename, mimetype, size, path) => {
//   const conn = await pool.getConnection();
//   try {
//     const result = await conn.query(
//       'INSERT INTO uploads (section_number, filename, mimetype, size, path) VALUES (?, ?, ?, ?, ?)',
//       [section_number, filename, mimetype, size, path]
//     );
//     return {
//       id: Number(result.insertId),
//       section_number,
//       filename,
//       mimetype,
//       size,
//       path,
//       upload_date: new Date()
//     };
//   } finally {
//     conn.release();
//   }
// };

// // 更新上傳紀錄 (可選)
// exports.update = async (id, section_number, filename, mimetype, size, path) => {
//   const conn = await pool.getConnection();
//   try {
//     const result = await conn.query(
//       'UPDATE uploads SET section_number = ?, filename = ?, mimetype = ?, size = ?, path = ? WHERE id = ?',
//       [section_number, filename, mimetype, size, path, id]
//     );
//     return { updated: result.affectedRows > 0 };
//   } finally {
//     conn.release();
//   }
// };

// // 刪除上傳紀錄
// exports.remove = async (id) => {
//   const conn = await pool.getConnection();
//   try {
//     const result = await conn.query('DELETE FROM uploads WHERE id = ?', [id]);
//     return { deleted: result.affectedRows > 0 };
//   } finally {
//     conn.release();
//   }
// };




// for sql--------------------
// 取得全部上傳紀錄

const db = require('../db');
exports.getAll = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM uploads ORDER BY upload_date DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// 依 ID 取得單筆紀錄
exports.getById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM uploads WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// 建立一筆上傳紀錄
exports.create = (section_number, filename, mimetype, size, path) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO uploads (section_number, filename, mimetype, size, path) VALUES (?, ?, ?, ?, ?)`,
      [section_number, filename, mimetype, size, path],
      function(err) {
        if (err) reject(err);
        else resolve({
          id: this.lastID,
          section_number,
          filename,
          mimetype,
          size,
          path,
          upload_date: new Date()
        });
      }
    );
  });
};

// 刪除上傳紀錄
exports.remove = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM uploads WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ deleted: this.changes > 0 });
    });
  });
};