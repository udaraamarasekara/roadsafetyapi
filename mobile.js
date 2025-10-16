const express = require('express')
const router = express.Router();
const db = require('./db');


function authMobile(req,res,next) {
 if(req.path == "/approve")
 {
   next()
 }
 else{
  const id = req.headers.id;
  const number = req.headers.number;
  if(id && number)
  {
  const sql = 'SELECT * FROM officers WHERE id = ? AND number = ? LIMIT 1';
  db.query(sql, [id,number], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      // No row found
      return res.status(404).json({ exists: false, message: 'User not found' });
    }

    // Row found
   next()
  });
  }
  else{
          return res.status(404).json({ exists: false, message: 'User not found' });

  }
 }
}

router.use(authMobile)


router.post("/location", (req, res) => {
    const {latitude, longitude,fcm} = req.body;
  const sql = "INSERT INTO checkpoint (latitude, longitude,status,fcm,officer_id) VALUES (?,?,'active',?,?)";
  db.query(sql, [latitude, longitude,fcm,req.headers.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database insert failed" });
    } 
    res.json({message:"work started!",workId:result.insertId});
  });
});

router.post("/approve", (req, res) => {
    const {id,number} = req.body;
  const sql = "UPDATE officers SET approved = 1 WHERE id = ? AND number = ?";
  db.query(sql, [id, number], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database insert failed" });
    } 
    res.json({message:"approved!"});
  });
});

router.delete('/location/:id', (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  const sql = 'DELETE FROM checkpoint WHERE id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error deleting record:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Work finished' });
  });
});


module.exports = router;
