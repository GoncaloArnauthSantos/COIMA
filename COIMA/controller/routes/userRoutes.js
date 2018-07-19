'use strict'

const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')()

module.exports = router

router.get('/login', userController.loginPage)
router.post('/login', userController.login)

router.get('/user/page/:page', userController.get)

router.get('/logout', userController.logOutView)
router.post('/logout', userController.logOut)

router.get('/signUp', userController.signUpView)
router.post('/signUp', userController.signUp)

