// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user:'myuser',
  password:'mypassword',
      // user:'root',
      // password:'',
  database: 'roadsafety'
  
});

// Connect once when app starts
db.connect(err => {
  if (err) {
    console.error(' DB connection failed:', err.message);
    process.exit(1); // Stop the app if DB fails
  }
  console.log('Connected to MySQL');
});

module.exports = db;
