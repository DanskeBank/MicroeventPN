'use strict'

const MongoClient = require('mongodb').MongoClient
const Q = require('q')
const uuidv4 = require('uuid/v4')
const itemsPerPage = 10

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
let teamsCollection = null
let monitorsStatusCollection = null
let opsChatCollection = null

const openConnection = () => {
  const d = Q.defer()

  // Use connect method to connect to the server
  MongoClient.connect(mongoConnectionDetails.mongoURL, function(err, db) {
    if (!err) {
      currentDBConnection = db
      teamsCollection = currentDBConnection.collection('teams')
      monitorsStatusCollection = currentDBConnection.collection('monitorsStatus')
      opsChatCollection = currentDBConnection.collection('opsChat')
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

const tryGetEnrollment = (enrollmentId) => {
  return tryGetEntity(enrollmentId, enrollmentsCollection, true)
}

const tryGetTeam = (apiKey) => {
  return tryGetEntity(apiKey, teamsCollection)
}

const tryGetMonitorStatus = (teamId) => {
  return tryGetEntity(teamId, monitorsStatusCollection)
}

const storeEnrollment = (enrollmentId, enrollment) => {
  return storeEntity(enrollmentId, enrollment, enrollmentsCollection)
}

const storeTeam = (apiKey, team) => {
  return storeEntity(apiKey, team, teamsCollection)
}

const storeMonitorStatus = (teamId, monitorStatus) => {
  return storeEntity(teamId, monitorStatus, monitorsStatusCollection)
}

const tryGetChatMessages = (pageId) => {
  if (!currentDBConnection) {
    throw new Error('Illegal state. Open a connection to the database by invoking openConnection before invoking tryGetEntity.')
  }

  // Get the documents collection
  const d = Q.defer()

  // Find some documents - Make it better: https://scalegrid.io/blog/fast-paging-with-mongodb/
  opsChatCollection.find().skip(pageId * itemsPerPage).limit(itemsPerPage).toArray(function(err, docs) {
    if (err) {
      d.reject(err)
    } else {
      d.resolve(docs)
    }
  })

  return d.promise
}

const storeChatMessage = (chatMessage) => {
  const chatMessageId = uuidv4()
  return storeEntity(chatMessageId, chatMessage, opsChatCollection)
}

const storeEntity = (key, value, collection) => {
  if (!currentDBConnection) {
    throw new Error('Illegal state. Open a connection to the database by invoking openConnection before invoking tryGetEntity.')
  }

  const d = Q.defer()

  collection.insert({key, value, createdAt: new Date()}, function(err, result){
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

const tryGetTeams = () => {
  if (!currentDBConnection) {
    throw new Error('Illegal state. Open a connection to the database by invoking openConnection before invoking tryGetEntity.')
  }

  // Get the documents collection
  const d = Q.defer()
  teamsCollection.find().toArray(function(err, docs) {
    if (err) {
      d.reject(err)
    } else {
      d.resolve(docs)
    }
  })

  return d.promise
}

const tryGetEntity = (entityId, collection, deleteAfterFetch) => {
  if (!currentDBConnection) {
    throw new Error('Illegal state. Open a connection to the database by invoking openConnection before invoking tryGetEntity.')
  }

  // Get the documents collection
  const d = Q.defer()

  // Find some documents
  collection.find({key: entityId}).toArray(function(err, docs) {
    if (err) {
      d.reject(err)
    } else {
      d.resolve(docs)
      if (docs && docs.length > 0 && deleteAfterFetch) {
        collection.deleteOne({key: entityId})
      }
    }
  })

  return d.promise
}

const closeConnection = () => {
  if (currentDBConnection) {
    currentDBConnection.close()
    currentDBConnection = null
    enrollmentsCollection = null
    teamsCollection = null
    monitorsStatusCollection = null
    opsChatCollection = null
  }
}

module.exports = {
  openConnection,
  tryGetEnrollment,
  storeEnrollment,
  tryGetTeam,
  storeTeam,
  tryGetMonitorStatus,
  storeMonitorStatus,
  tryGetChatMessages,
  storeChatMessage,
  tryGetTeams,
  closeConnection
}