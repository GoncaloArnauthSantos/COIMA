'use strict'

const express = require('express')
const router = express.Router()
const commentController = require('../controllers/commentController')()

module.exports = router

/**
 *  add a commentary with the information given by the user add call the service method
 *  after that make render only of this new commentary
 */
router.post('/comments', commentController.addComment)

/**
 *  add a reply with the information given by the user add call the service method
 *  after that make render only of this new reply
 */
router.post('/reply', commentController.addReply)
