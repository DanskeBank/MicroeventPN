'use strict'

const uuidv4 = require('uuid/v4')
const Pipeline = require('pipes-and-filters')
const mongodb = require('../../utilities/mongodb')

const logRequestToAudit = (input, next) => {
  /* TODO: implement */
  let error = null
  input.requestId = uuidv4()
  console.log('Log request to audit done')
  next(error, input)
}

const authenticateCall = (input, next) => {
  const apiKey = input.get('authorization')
  if (!apiKey) {
    console.error('Authentication error. No authorization header found. Aborting...')
    next(new Error('Unauthorized'), Pipeline.break)
    return
  }

  if ( apiKey == process.env.ADMIN_APIKEY ) {
    input.team = {
      teamId: 1,
      teamName: 'Administrators',
      teamEmailAddress: 'admin@parsonsnet.com',
      teamMembers: ['TheBigBrother']
    }
    next(null, input)
    return
  }

  const team = mongodb.tryGetTeam(apiKey).then(team => {
    input.team = team
    console.log('Request authenticated correctly.')
    next(null, input)
  }).catch(err => {
    console.error('Authentication error. Unrecognized APIKey used in request. Aborting...')
    next(new Error('Unauthorized'), Pipeline.break)
    return
  })
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