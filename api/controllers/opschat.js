'use strict'
const mongodb = require('../../utilities/mongodb')
const defaultPipe = require('../helpers/defaultPipe')
const Pipeline = require('pipes-and-filters')

const getPublishedMessages = (req, res) => {
  const pipeline = defaultPipe.getPipelineInstance(getPublishedMessagesWorker, (err, result) => {
    // This is executed at the end of the pipeline
    if (err) {
      res.status(500).send({message: 'Internal Server Error'})
      return
    }
    res.status(200).json(result)
  })
  pipeline.execute(req)
}

const publishMessage = (req, res) => {
  const pipeline = defaultPipe.getPipelineInstance(publishMessageWorker, (err, result) => {
    // This is executed at the end of the pipeline
    if (err) {
      res.status(500).send({message: 'Internal Server Error'})
      return
    }
    res.status(200).json(result)
  })
  pipeline.execute(req)
}

const getPublishedMessagesWorker = (input, next) => {
  if (!input.team) {
    console.error('Deep authentication error. This should never happen. Aborting...')
    next(new Error('Unauthorized'), Pipeline.break)
    return
  }

  const pageId = input.swagger.params.pageId.value
  if (!pageId) {
    pageId = 0
  }

  mongodb.tryGetChatMessages(pageId).then(messages => {
    next(null, {messages})
  }).catch(err => {
    next(err, Pipeline.break)
  })
}

const publishMessageWorker = (input, next) => {
  if (!input.team) {
    console.error('Deep authentication error. This should never happen. Aborting...')
    next(new Error('Unauthorized'), Pipeline.break)
    return
  }

  input.body.team = input.team
  input.body.timestamp = Date.now()
  mongodb.storeChatMessage(input.body).then(() => {
    next(null, {status: 'OK'})
  }).catch(err => {
    next(err, Pipeline.break)
  })
} 

module.exports = {
  getPublishedMessages,
  publishMessage
}
