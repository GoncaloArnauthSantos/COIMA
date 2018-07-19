'use strict'

const express = require('express')
const router = express.Router()
const listController = require('../controllers/listController')()

module.exports = router

router.post('/updateListName', listController.update)

router.get('/list/:listId/page/:page', listController.get)

router.get('/pubList/page/:page', listController.getPublics)

router.delete('/deleteMovie', listController.deleteMovieFromList)

router.delete('/deleteList', listController.deleteList)

router.post('/addLst', listController.addList)

router.post('/addMovie', listController.addMovie)

router.get("/shareList/page/:page", listController.getSharedList)