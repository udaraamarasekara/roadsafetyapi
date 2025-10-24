const express = require('express');
const router = express.Router();
const db = require('./db');
const { setViolation, getViolation } = require('./violations');
const { notifyViolation } = require('./notification');

// ------------------ ROUTES ------------------

router.post("/currentStatus", async (req, res) => {
    const { time, longitude, latitude, speed, vehicleNo, vehicle, vehicleColor, direction, type } = req.body;

    try {
        const result = await checkForSpeed(longitude, latitude);
        const signalLight = await findMostRecentSignalLight(longitude, latitude, direction);
        let prevViolation = getViolation(vehicleNo);

        if (prevViolation) {
            prevViolation.type = "delete";
            const checkpoint = await findMostRecentCheckpoint(longitude, latitude, direction);

            notifyViolation(req, prevViolation.fcm);
            notifyViolation(req, checkpoint.fcm);
            setViolation(vehicleNo, { time, longitude, latitude, speed, vehicle, vehicleColor, checkpoint, direction, type });
        }

        res.json({
            speed: result,
            signalLight,
            isViolated: prevViolation ? 1 : 0
        });
    } catch (err) {
        console.error("currentStatus error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/violation", async (req, res) => {
    const { time, longitude, latitude, speed, vehicleNo, vehicle, vehicleColor, direction, type } = req.body;

    try {
        const checkpoint = await findMostRecentCheckpoint(longitude, latitude, direction);
        notifyViolation(req, checkpoint.fcm);
        setViolation(vehicleNo, { time, longitude, latitude, speed, vehicle, vehicleColor, checkpoint, direction, type });

        res.send("violation recorded");
    } catch (err) {
        console.error("violation route error:", err);
        res.status(500).send("Internal server error");
    }
});

// ------------------ DATABASE HELPERS ------------------

async function checkForSpeed(longitude, latitude) {
    const [results] = await db.query("SELECT * FROM routes");
    return results.find(r => latitude > r.minlat && latitude < r.maxlat &&
                             longitude > r.minlng && longitude < r.maxlng) || null;
}

async function searchCheckpoints() {
    const [results] = await db.query("SELECT * FROM checkpoint");
    return results;
}

async function searchSignalLights() {
    const [results] = await db.query("SELECT * FROM signal_lights");
    return results;
}

// ------------------ UTILITIES ------------------

function distance2D(coord1, coord2) {
    const dx = coord2.longitude - coord1.longitude;
    const dy = coord2.latitude - coord1.latitude;
    return Math.sqrt(dx * dx + dy * dy);
}

function filterByDirection(items, longitude, latitude, direction) {
    return items.filter(item => {
        if (direction > 0 && direction < 90) return item.latitude > latitude && item.longitude > longitude;
        if (direction >= 90 && direction < 180) return item.latitude > latitude && item.longitude < longitude;
        if (direction >= 180 && direction < 270) return item.latitude < latitude && item.longitude < longitude;
        if (direction >= 270 && direction <= 360) return item.latitude < latitude && item.longitude > longitude;
        return false;
    });
}

async function findMostRecentSignalLight(longitude, latitude, direction) {
    const signals = await searchSignalLights();
    const filtered = filterByDirection(signals, longitude, latitude, direction);
    if (!filtered.length) return null;
    return filtered.reduce((prev, curr) => distance2D(curr, { longitude, latitude }) < distance2D(prev, { longitude, latitude }) ? curr : prev);
}

async function findMostRecentCheckpoint(longitude, latitude, direction) {
    const checkpoints = await searchCheckpoints();
    const filtered = filterByDirection(checkpoints, longitude, latitude, direction);
    if (!filtered.length) return null;
    return filtered.reduce((prev, curr) => distance2D(curr, { longitude, latitude }) < distance2D(prev, { longitude, latitude }) ? curr : prev);
}

module.exports = router;
