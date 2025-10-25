const express = require('express');
const router = express.Router();
const db = require('./db'); // mysql2/promise pool
const { clearViolation, getViolation } = require('./violations');

// ------------------ AUTH MIDDLEWARE ------------------

async function authMobile(req, res, next) {
    try {
        if (req.path === "/approve") {
            return next();
        }

        const id = req.headers.id;
        const number = req.headers.number;

        if (!id || !number) {
            return res.status(404).json({ exists: false, message: 'User not found' });
        }

        const [results] = await db.query(
            'SELECT * FROM officers WHERE id = ? AND number = ? LIMIT 1',
            [id, number]
        );

        if (results.length === 0) {
            return res.status(404).json({ exists: false, message: 'User not found' });
        }

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

router.use(authMobile);

// ------------------ ROUTES ------------------

router.post("/location", async (req, res) => {
    const { latitude, longitude, fcm } = req.body;
    const officerId = req.headers.id;

    try {
        const [result] = await db.query(
            "INSERT INTO checkpoint (latitude, longitude, status, fcm, officer_id) VALUES (?, ?, 'active', ?, ?)",
            [latitude, longitude, fcm, officerId]
        );

        res.json({ message: "Work started!", workId: result.insertId });
    } catch (err) {
        console.error('Insert checkpoint error:', err);
        res.status(500).json({ error: "Database insert failed" });
    }
});

router.post("/approve", async (req, res) => {
    const { id, number } = req.body;

    try {
        const [result] = await db.query(
            "UPDATE officers SET approved = 1 WHERE id = ? AND number = ?",
            [id, number]
        );

        res.json({ message: "Approved!" });
    } catch (err) {
        console.error('Approve officer error:', err);
        res.status(500).json({ error: "Database update failed" });
    }
});

router.delete('/location/:id', async (req, res) => {
    const checkpointId = req.params.id;

    try {
        const [result] = await db.query(
            'DELETE FROM checkpoint WHERE id = ?',
            [checkpointId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Checkpoint not found' });
        }

        res.json({ message: 'Work finished' });
    } catch (err) {
        console.error('Delete checkpoint error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

router.delete('/violation/:id', async (req, res) => {
    const vehicleNo = req.params.id;

    try {
        await clearViolation(vehicleNo); // make sure clearViolation is async
        res.json({ message: 'Tracking finished' });
    } catch (err) {
        console.error('Clear violation error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

router.get('/currentStatus/:id', async (req, res) => {
    const vehicleNo = req.params.id;   
    let violation =getViolation(vehicleNo)       
    res.json({ latitude:violation.latitude,longitude:violation.longitude });
 
    
});

module.exports = router;
