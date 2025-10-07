const express = require('express')
const router = express.Router();
const db = require('./db');


router.post("/location", (req, res) => {
    const {latitude, longitude,fcm} = req.body;
  const sql = "INSERT INTO checkpoint (latitude, longitude,status,fcm) VALUES (?,?,'active',?)";
  db.query(sql, [latitude, longitude,fcm], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database insert failed" });
    } 
    res.json({message:"work started!"});
  });
});

module.exports = router;
