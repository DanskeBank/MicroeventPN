'use strict'

const mongodb = require('../../utilities/mongodb')
const defaultPipe = require('../helpers/defaultPipe')
const Pipeline = require('pipes-and-filters')
const AdminId = 1

const getTeams = (req, res) => {
  const pipeline = defaultPipe.getPipelineInstance(getTeamsWorker, (err, result) => {
    // This is executed at the end of the pipeline
    if (err) {
      res.status(500).send({message: 'Internal Server Error'})
      return
    }
    res.status(200).json(result)
  })
  pipeline.execute(req)
}

const getTeamsWorker = (input, next) => {
  if (!input.team) {
    console.error('Deep authentication error. This should never happen. Aborting...')
    next(new Error('Unauthorized'), Pipeline.break)
    return
  }

  if (input.team.id !== AdminId) {
    console.error('Hacker alarm. This is malicius behaviour. Aborting...')
    next(new Error('Unauthorized'), Pipeline.break)
    return
  }

  mongodb.tryGetTeams().then(teams => {
    next(null, {teams: teams.map(team => {
      return team.value
    })})
  }).catch(err => {
    console.error('Error while trying to fetch monitor status from the database.')
    next(new Error('Internal Server Error'), Pipeline.break)
  })
}

module.exports = {
  getTeams
}
