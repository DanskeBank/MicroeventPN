'use strict'

const uuidv4 = require('uuid/v4')
const Pipeline = require('pipes-and-filters')

const logRequestToAudit = (input, next) => {
  /* TODO: implement */
  let error = null
  input.requestId = uuidv4()
  console.log('Log request to audit done')
  next(error, input)
}

const authenticateCall = (input, next) => {
  /* TODO: implement */

  let error = null
  if (error) {
    console.error('Authentication error. Aborting...')
    next(null, Pipeline.break)
  } else {
    let output = input
    console.log('Authenticate call done')
    next(error, output)
  }
}

const logResponseToAudit = (input, next) => {
  /* TODO: implement */

  let error = null
  console.log('Log response to audit call done')
  next(error, input)
}

const getPipelineInstance = (businessLogic, doneCallBack, authenticationFunction) => {
  if (!businessLogic || typeof businessLogic !== 'function') {
    throw new Error('Illegal argument: businessLogic')
  }
  const pipeline = Pipeline.create('Default Pipeline')
  pipeline.use(logRequestToAudit)

  if (!authenticationFunction || typeof(authenticationFunction) !== 'function') {
    pipeline.use(authenticateCall)
  } else {
    pipeline.use(authenticationFunction)    
  }

  pipeline.use(businessLogic)
  pipeline.use(logResponseToAudit)
  pipeline.once('error', (err) => {
    console.error(err)
    doneCallBack(err)
  })
  pipeline.once('end', function(result) {
    if (result === Pipeline.break) {
      doneCallBack(result)
    } else {
      doneCallBack(null, result)
    }
  })  
  return pipeline
}

module.exports = {
  getPipelineInstance
}