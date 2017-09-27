'use strict'

const mongodb = require('../../utilities/mongodb')
const defaultPipe = require('../helpers/defaultPipe')
const emailService = require('@sendgrid/mail')
const uuidv4 = require('uuid/v4')
const crypto = require('crypto')
const Pipeline = require('pipes-and-filters')

const finalizeEnrollment = (req, res) => {
  const pipeline = defaultPipe.getPipelineInstance(finalizeEnrollmentWorker, (err, result) => {
    // This is executed at the end of the pipeline
    if (err) {
      res.status(500).send({message: 'Internal Server Error'})
      return
    }
    res.status(200).json(result)
  }, (input, next) => {
    // Do not require any authentication
    next(null, input)
  })
  pipeline.execute(req)
}

const initEnrollment = (req, res) => {
  const pipeline = defaultPipe.getPipelineInstance(initEnrollmentWorker, (err, result) => {
    // This is executed at the end of the pipeline
    if (err) {
      res.status(500).send({message: 'Internal Server Error'})
      return
    }
    res.status(200).json(result)
  }, (input, next) => {
    // Do not require any authentication
    next(null, input)
  })
  pipeline.execute(req)
}

const finalizeEnrollmentWorker = (input, next) => {
  const enrollId = input.swagger.params.enrollId.value
  if (!enrollId) {
    next(new Error('Bad Request'), Pipeline.break)
  } else {
    mongodb.tryGetEnrollment(enrollId).then(enrollment => {
      if (enrollment && enrollment.length == 1 && enrollment[0].value) {
        crypto.randomBytes(48, (err, buffer) => {
          if (err) {
            next(err, Pipeline.break)
          } else {
            const apiKey = buffer.toString('hex')
            const team = enrollment[0].value
            team.teamId = uuidv4()
            mongodb.storeTeam(apiKey, enrollment[0].value).then(() => {
              next(null, {apiKey, teamId: team.teamId})
            }).catch(err => {
              next(err, Pipeline.break)
            })
          }
        })
      } else {
        next(new Error('Enrollment not found'), Pipeline.break)
      }
    }).catch(err => {
      next(err, Pipeline.break)
    })
  }
}

const initEnrollmentWorker = (input, next) => {
  input.body.id = uuidv4()
  mongodb.storeEnrollment(input.requestId, input.body).then(() => {
    const msg = {
      to: input.body.teamEmailAddress,
      from: 'contacts@parsonsnet.com',
      subject: 'Your confirmation mail for ParsonsNet',
      text: 'Welcome to ParsonsNet! This is your confirmation key: ' + input.requestId,
      html: '<h1>Welcome to ParsonsNet</h1>This is your confirmation key: <strong>' + input.requestId + '</strong>',
    }
    emailService.setApiKey(process.env.SENDGRID_API_KEY)
    emailService.send(msg).then(() => {
      next(null, {status: 'OK'})
    }).catch(err => {
      next(err, Pipeline.break)
    })
  }).catch(err => {
    next(err, Pipeline.break)
  })
}

module.exports = {
  finalizeEnrollment,
  initEnrollment,
  mongodb,      // for test only
  emailService  // for test only
}
