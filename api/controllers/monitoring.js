'use strict'

const defaultPipe = require('../helpers/defaultPipe')
const Pipeline = require('pipes-and-filters')

const pushMonitoringData = (req, res) => {
    const pipeline = defaultPipe.getPipelineInstance(pushMonitoringDataWorker, (err, result) => {
    // This is executed at the end of the pipeline
    if (err) {
      res.status(400).end()
      return;
    }

    res.status(200).end()
  })
  pipeline.execute(req)
}

const getMonitoringData = (req, res) => {
  res.json('OK')
}

const pushMonitoringDataWorker = (input, next) => {
  //Store data
  let error = null
  console.log('Logic to store data done.')
  let output = {
    requestId: input.requestId
  }
  next(error, output)
}

module.exports = {
  pushMonitoringData,
  getMonitoringData
}
