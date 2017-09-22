'use strict'

const MongoClient = require('mongodb').MongoClient
const Q = require('q')
const getMongoConnectionDetails = () => {
  let mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL
  let mongoURLLabel = ''
  if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
    const mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase()
    const mongoHost = process.env[mongoServiceName + '_SERVICE_HOST']
    const mongoPort = process.env[mongoServiceName + '_SERVICE_PORT']
    const mongoDatabase = process.env[mongoServiceName + '_DATABASE']
    const mongoPassword = process.env[mongoServiceName + '_PASSWORD']
    const mongoUser = process.env[mongoServiceName + '_USER']

    if (mongoHost && mongoPort && mongoDatabase) {
      mongoURLLabel = mongoURL = 'mongodb://'
      if (mongoUser && mongoPassword) {
        mongoURL += mongoUser + ':' + mongoPassword + '@'
      }
      // Provide UI label that excludes user id and pw
      mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase
      mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase
    }
  }
  return {
    mongoURLLabel,
    mongoURL
  }
}
const mongoConnectionDetails = getMongoConnectionDetails()

let currentDBConnection = null
let enrollmentsCollection = null

const openConnection = () => {
  const d = Q.defer()

  // Use connect method to connect to the server
  MongoClient.connect(mongoConnectionDetails.mongoURL, function(err, db) {
    if (!err) {
      currentDBConnection = db
      enrollmentsCollection = currentDBConnection.collection('enrollments')
      enrollmentsCollection.createIndex('createdAt', { expireAfterSeconds: 3600 } )
      console.log('Connected to MongoDB at ' + mongoConnectionDetails.mongoURLLabel)
      d.resolve()
    } else {
      console.error('Failed connection to MongoDB at ' + mongoConnectionDetails.mongoURLLabel)
      console.error(err)
      d.reject(err)
    }
  })
  return d.promise
}

const tryGetEnrollment = function(enrollId) {
  if (!currentDBConnection) {
    throw new Error('Illegal state. Open a connection to the database by invoking openConnection before invoking tryGetEnrollment.')
  }

  // Get the documents collection
  const d = Q.defer()

  // Find some documents
  enrollmentsCollection.find({key: enrollId}).toArray(function(err, docs) {
    if (err) {
      d.reject(err)
    } else {
      d.resolve(docs)
      if (docs && docs.length > 0) {
        enrollmentsCollection.deleteOne({key: enrollId})
      }
    }
  })

  return d.promise
}


const storeEnrollment = (key, value) => {
  const d = Q.defer()
  enrollmentsCollection.insert({key, value, createdAt: new Date()}, function(err, result){
    if (err) {
      console.error('Failed connection to MongoDB at ' + mongoConnectionDetails.mongoURLLabel)
      console.error(err)
      d.reject(err)
    } else {
      d.resolve(result.result)
    }
  })
  return d.promise
}

const closeConnection = () => {
  if (currentDBConnection) {
    currentDBConnection.close()
    currentDBConnection = null
    enrollmentsCollection = null
  }
}

module.exports = {
  openConnection,
  tryGetEnrollment,
  storeEnrollment,
  closeConnection
}