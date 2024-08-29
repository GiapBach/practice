const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: '10.11.90.15',
  port: '3306',
  user: 'AppUser',
  password: 'Special888%',
  database: 'Study',
});

module.exports = pool;