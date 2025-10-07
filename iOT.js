const express = require('express')
const router = express.Router();
const db = require('./db');
const { setViolation, getViolation } = require('./violations');
const { notifyViolation } = require('./notification');

router.post("/currentStatus", async(req, res) => {

   const {time,longitude,latitude,speed,vehicleNo,vehicle,vehicleColor,direction} = req.body
    var result = await checkForSpeed(longitude,latitude)
    var signalLight = await findMostRecentSignalLight(longitude,latitude,direction)
    var prevViolation = getViolation(vehicleNo)
    prevViolation.type = "delete"
    if(prevViolation)
    {
    let checkpoint = await findMostRecentCheckpoint(longitude,latitude,direction) 
    notifyViolation(req,prevViolation.fcm)
    notifyViolation(req,checkpoint.fcm)
    setViolation(vehicleNo,{time,longitude,latitude,speed,vehicle,vehicleColor,checkpoint,direction,type})
   
    }
   res.json({"speed":result, "signalLight":signalLight})
});

router.post("/violation", async(req, res) => {
   const {time,longitude,latitude,speed,vehicleNo,vehicle,vehicleColor,direction,type} = req.body
   
    let checkpoint = await findMostRecentCheckpoint(longitude,latitude,direction) 
    notifyViolation(req,checkpoint.fcm)
    setViolation(vehicleNo,{time,longitude,latitude,speed,vehicle,vehicleColor,checkpoint,direction,type})
   
   res.send("violation recorded")
});


async function checkForSpeed(longitude, latitude) {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM routes", (err, results) => {
      if (err) return reject(err);

      for (let result of results) {
        if (
          result.minlat < latitude && latitude < result.maxlat &&
          result.minlng < longitude && longitude < result.maxlng
        ) {
          return resolve(result);
        }
      }

      resolve(null);
    });
  });
}

async function searchCheckpoints() {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM checkpoint", (err, results) => {
      if (err) return reject(err);
       resolve(results);
    });
  });
}

async function searchSignalLights() {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM signal_ights", (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}
// usage inside an Express route



function distance2D(coord1, coord2) {
  const dx = coord2.longitude - coord1.longitude; // X = longitude
  const dy = coord2.latitude - coord1.latitude; // Y = latitude
  return Math.sqrt(dx * dx + dy * dy);
}


async function findMostRecentSignalLight(longitude,latitude,direction)
{   
  var signals = await searchSignalLights()
 if (direction < 90 && direction > 0) 
  {  
 return  signals.reduce((prev, curr) => 
         curr.latitude > latitude && curr.longitude > longitude &&  distance2D(curr, {longitude,latitude}) < distance2D(prev, {longitude,latitude}) ? curr : prev
   )
  }
   if (direction < 180 && direction > 90) 
{
   return  signals.reduce((prev, curr) => 
         curr.latitude > latitude && curr.longitude < longitude &&  distance2D(curr, {longitude,latitude}) < distance2D(prev, {longitude,latitude}) ? curr : prev
   )
}
 if (direction < 270 && direction > 180) 
  {  
 return  signals.reduce((prev, curr) => 
         curr.latitude < latitude && curr.longitude < longitude &&  distance2D(curr, {longitude,latitude}) < distance2D(prev, {longitude,latitude}) ? curr : prev
   )
  }
   if (direction < 180 && direction > 90) 
{
   return  signals.reduce((prev, curr) => 
         curr.latitude < latitude && curr.longitude > longitude &&  distance2D(curr, {longitude,latitude}) < distance2D(prev, {longitude,latitude}) ? curr : prev
   )
}
else{
  return "eee"
}
}


async function findMostRecentCheckpoint(longitude,latitude,direction)
{   
  var checkpoints = await searchCheckpoints()
 if (direction < 90 && direction > 0) 
  {  
 return  checkpoints.reduce((prev, curr) => 
         curr.latitude > latitude && curr.longitude > longitude &&  distance2D(curr, {longitude,latitude}) < distance2D(prev, {longitude,latitude}) ? curr : prev
   )
  }
   if (direction < 180 && direction > 90) 
{
   return  checkpoints.reduce((prev, curr) => 
         curr.latitude > latitude && curr.longitude < longitude &&  distance2D(curr, {longitude,latitude}) < distance2D(prev, {longitude,latitude}) ? curr : prev
   )
}
 if (direction < 270 && direction > 180) 
  {  
 return  checkpoints.reduce((prev, curr) => 
         curr.latitude < latitude && curr.longitude < longitude &&  distance2D(curr, {longitude,latitude}) < distance2D(prev, {longitude,latitude}) ? curr : prev
   )
  }
   if (direction < 180 && direction > 90) 
{
   return  checkpoints.reduce((prev, curr) => 
         curr.latitude < latitude && curr.longitude > longitude &&  distance2D(curr, {longitude,latitude}) < distance2D(prev, {longitude,latitude}) ? curr : prev
   )
}
else{
  return "eee"
}
}

module.exports = router;
