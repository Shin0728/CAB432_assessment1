// establishes the connection to the database.

require('dotenv').config();
const mariadb = require('mariadb');

console.log('dotenv path:', __dirname);
console.log('DB_USER from env:', process.env.DB_USER); 

const pool = mariadb.createPool({
  host: process.env.DB_HOST,   //|| 'localhost'
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,  // || 'user'
  password: process.env.DB_PASSWORD,  // || 'pass'
  database: process.env.DB_NAME,  // || 'videosdb'
  connectionLimit: 5,
});

// Init logic without messing with exports
(async () => {
  let conn;
  try {
    console.log("Connecting to DB:", process.env.DB_HOST, process.env.DB_PORT);
    conn = await pool.getConnection();
    console.log('Connection successful.');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section_number VARCHAR(50),
        filename VARCHAR(255),
        mimetype VARCHAR(100),
        size BIGINT,
        path VARCHAR(500),
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error('DB init failed:', err.message);
  } finally {
    if (conn) {
      conn.release();
      console.log('Releasing connection...');
    }
  }
})();

module.exports = pool;



// const mariadb = require('mariadb');
// require('dotenv').config();

// const pool = mariadb.createPool({
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   connectionLimit: 5,
// });

// (async () => {
//   let conn;
//   try {
//     conn = await pool.getConnection();
//     console.log('Connection successful!');
//     const rows = await conn.query('SELECT NOW() as now');
//     console.log(rows);
//   } catch (err) {
//     console.error('DB connection failed:', err);
//   } finally {
//     if (conn) conn.release();
//   }
// })();
