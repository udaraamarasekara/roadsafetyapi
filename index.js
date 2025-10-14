const express = require('express')
const app = express()
const port = 3000
const mobileRoutes = require('./mobile')
const iotRoutes = require('./iOT')
app.use(express.json());




app.use("/iot", iotRoutes)
app.use("/mobile", mobileRoutes)



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
