'use strict'

const probe = (req, res) => {
  // this sends back a JSON response which is a single string
  res.json({status: 'OK'})
}

module.exports = {
  probe
}
