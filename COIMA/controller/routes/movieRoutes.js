'use strict'

const express = require('express')
const router = express.Router()
const movieController = require('../controllers/movieController')()

module.exports = router

router.get('/', movieController.home)

router.get('/search', movieController.get)

router.get('/movie/:movieId', movieController.getById)

router.get('/actor/:actorId', movieController.getActor)