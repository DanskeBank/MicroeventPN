'use strict'

const getPublishedMessages = (req, res) => {
  // this sends back a JSON response which is a single string
  res.json({status: 'OK'})
}

const publishMessage = (req, res) => {
  // this sends back a JSON response which is a single string
  res.json({status: 'OK'})
}

module.exports = {
  getPublishedMessages,
  publishMessage
}
