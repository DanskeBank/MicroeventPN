'use strict'

const mongodb = require('./utilities/mongodb')
const SwaggerExpress = require('swagger-express-mw')
const app = require('express')()
const port = process.env.PORT || 8070
const config = {
  appRoot: __dirname // required config
}


SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err }

  // install middleware
  swaggerExpress.register(app)
  
  mongodb.openConnection().then(() => {
    console.log('All wired. Ready to rock!')
    app.listen(port)
  }).catch(err => {
    throw err
  })
})

module.exports = app // for testing
