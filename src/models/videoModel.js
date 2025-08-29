// responsible for the main interactions with the database.
// uploadRepository.js
// 負責跟 uploads table 互動

const pool = require('../db');

// 取得全部上傳紀錄
exports.getAll = async () => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT * FROM uploads ORDER BY upload_date DESC');
    return rows;
  } finally {
    conn.release();
  }
};

// 依 ID 取得單筆紀錄
exports.getById = async (id) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT * FROM uploads WHERE id = ?', [id]);
    return rows[0];
  } finally {
    conn.release();
  }
};

// 建立一筆上傳紀錄
exports.create = async (section_number, filename, mimetype, size, path) => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      'INSERT INTO uploads (section_number, filename, mimetype, size, path) VALUES (?, ?, ?, ?, ?)',
      [section_number, filename, mimetype, size, path]
    );
    return {
      id: Number(result.insertId),
      section_number,
      filename,
      mimetype,
      size,
      path,
      upload_date: new Date()
    };
  } finally {
    conn.release();
  }
};

// 更新上傳紀錄 (可選)
exports.update = async (id, section_number, filename, mimetype, size, path) => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      'UPDATE uploads SET section_number = ?, filename = ?, mimetype = ?, size = ?, path = ? WHERE id = ?',
      [section_number, filename, mimetype, size, path, id]
    );
    return { updated: result.affectedRows > 0 };
  } finally {
    conn.release();
  }
};

// 刪除上傳紀錄
exports.remove = async (id) => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query('DELETE FROM uploads WHERE id = ?', [id]);
    return { deleted: result.affectedRows > 0 };
  } finally {
    conn.release();
  }
};




