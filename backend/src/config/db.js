const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASS     || '',
  database:           process.env.DB_NAME     || 'football_tournament',
  waitForConnections: true,
  connectionLimit:    10,
  charset:            'utf8mb4',
});

module.exports = pool;
