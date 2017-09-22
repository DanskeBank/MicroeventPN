'use strict'

const mongodb = require('../../utilities/mongodb')
const defaultPipe = require('../helpers/defaultPipe')
const emailService = require('@sendgrid/mail')
emailService.setApiKey(process.env.SENDGRID_API_KEY)

const finalizeEnrollment = (req, res) => {
  const enrollId = req.swagger.params.enrollId.value
  if (!enrollId) {
    res.status(400).send({message: 'Bad Request'})
  }

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

}

const initEnrollmentWorker = (input, next) => {
  mongodb.storeEnrollment(input.requestId, input.body).then(() => {
    const msg = {
      to: input.body.teamEmailAddress,
      from: 'contacts@parsonsnet.com',
      subject: 'Your API Key',
      text: 'Welcome to ParsonsNet! This is your API Key: ' + input.requestId,
      html: '<h1>Welcome to ParsonsNet</h1>This is your API Key: <strong>' + input.requestId + '</strong>',
    }
    emailService.send(msg)
    next(null, {status: 'OK'})
  }).catch(err => {
    next(err, input)
  })
}

module.exports = {
  finalizeEnrollment,
  initEnrollment,
  mongodb,      // for test only
  emailService  // for test only
}
