'use strict'

const getStatus = (req, res) => {
  // this sends back a JSON response which is a single string
  res.json({status: 'OK'})
}

const updateStatus = (req, res) => {
  // this sends back a JSON response which is a single string
  res.json({status: 'OK'})
}

module.exports = {
  getStatus,
  updateStatus
}
