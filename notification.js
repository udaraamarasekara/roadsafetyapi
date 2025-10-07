const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


function notifyViolation(req,token) {
  const { time, longitude, latitude, speed, vehicleNo, vehicle, vehicleColor, direction,type } = req.body;

  const message = {
    notification: {
      title: `${type} Violation`,
      body: `${vehicleColor} colored ${vehicle} with no ${vehicleNo}`
    },
     data: {
    time: time.toString(),
    speed: speed.toString(),
    vehicleNo: vehicleNo.toString(),
    vehicle: vehicle.toString(),
    vehicleColor: vehicleColor.toString(),
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    direction: direction.toString(),
    type: type.toString()
  },
    token
  };

  admin.messaging().send(message)
    .then(response => {
      console.log(response)
      return ({ success: true, response });
    })
    .catch(error => {
      console.log(error)
     return ({ success: false, error });
    });
}


module.exports = {notifyViolation  };
