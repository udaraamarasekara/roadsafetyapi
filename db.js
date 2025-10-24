// db.js


const mysql = require('mysql2/promise'); // note the /promise

// Create a connection pool
const db = mysql.createPool({
  host: 'localhost',
  user:'myuser',
  password:'mypassword',
      // user:'root',
      // password:'',
  database: 'roadsafety',
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0
});

module.exports = db;
