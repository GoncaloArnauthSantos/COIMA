'use strict'

const express = require('express')
const router = express.Router()
const inveteController = require('../controllers/inveteController')()

module.exports = router

router.get('/invitePage', inveteController.get)

router.post('/invite', inveteController.send)

router.post('/acceptList', inveteController.accept)

router.post('/denyList', inveteController.deny)