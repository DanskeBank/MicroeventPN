'use strict'

const mongodb = require('../../utilities/mongodb')
const defaultPipe = require('../helpers/defaultPipe')
const Pipeline = require('pipes-and-filters')
const AdminId = 1

const getStatus = (req, res) => {
  const pipeline = defaultPipe.getPipelineInstance(getStatusWorker, (err, result) => {
    // This is executed at the end of the pipeline
    if (err) {
      res.status(500).send({message: 'Internal Server Error'})
      return
    }
    res.status(200).json(result)
  })
  pipeline.execute(req)
}

const pushUpdate = (req, res) => {
  const pipeline = defaultPipe.getPipelineInstance(pushUpdateWorker, (err, result) => {
    // This is executed at the end of the pipeline
    if (err) {
      res.status(500).send({message: 'Internal Server Error'})
      return
    }
    res.status(200).json(result)
  })
  pipeline.execute(req)
}

const getStatusWorker = (input, next) => {
  if (!input.team) {
    console.error('Deep authentication error. This should never happen. Aborting...')
    next(new Error('Unauthorized'), Pipeline.break)
    return
  }

  const teamId = input.swagger.params.teamId.value
  if (input.team.teamId !== AdminId && input.team.teamId !== teamId) {
    console.error('Hacker alarm. This is malicius behaviour. Aborting...')
    next(new Error('Unauthorized'), Pipeline.break)
    return
  }

  mongodb.tryGetMonitorStatus(teamId).then(monitorStatus => {
    next(null, monitorStatus)
  }).catch(err => {
    console.error('Error while trying to fetch monitor status from the database.')
    next(new Error('Internal Server Error'), Pipeline.break)
  })
}

const pushUpdateWorker = (input, next) => {
  if (!input.team) {
    console.error('Deep authentication error. This should never happen. Aborting...')
    next(new Error('Unauthorized'), Pipeline.break)
    return
  }

  const teamId = input.swagger.params.teamId.value
  if (input.team.teamId !== teamId) {
    console.error('Hacker alarm. This is malicius behaviour. Aborting...')
    next(new Error('Unauthorized'), Pipeline.break)
    return
  }

  mongodb.storeMonitorStatus(teamId, input.body).then(() => {
    next(null, {status: 'OK'})
  }).catch(err => {
    console.error('Error while trying to store monitor status from to the database.')
    next(new Error('Internal Server Error'), Pipeline.break)
  })
}

module.exports = {
  getStatus,
  pushUpdate
}
