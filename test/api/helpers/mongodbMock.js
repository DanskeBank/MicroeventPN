'use strict'

const Q = require('q')
let enrollmentsCollection = null

const openConnection = () => {
  const d = Q.defer()
  enrollmentsCollection = {}
  d.resolve()
  return d.promise
}

const tryGetEnrollment = function(enrollId) {
  const d = Q.defer()
  d.resolve(enrollmentsCollection[enrollId])
  return d.promise
}


const storeEnrollment = (key, value) => {
  const d = Q.defer()
  enrollmentsCollection[key] = value
  d.resolve()
  return d.promise
}

const closeConnection = () => {
  if (currentDBConnection) {
    enrollmentsCollection = null
  }
}

module.exports = {
  openConnection,
  tryGetEnrollment,
  storeEnrollment,
  closeConnection
}