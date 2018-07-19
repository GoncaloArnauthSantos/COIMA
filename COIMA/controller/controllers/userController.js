'use strict'

const passport = require('passport')
const dataSource = require('../../model/dataSource')
const userService = require('../services/userService')(dataSource)
const listService = require('../services/listService')(dataSource)
const utils = require('../../utils/utils')

module.exports = function init() {

    return {
        loginPage,
        get,
        logOutView,
        signUpView,
        logOut,
        login,
        signUp
    }

    function loginPage(req, res) {
        if(req.user) return res.redirect('/logout')

        const contextObj = utils.setFlashMessageInCtxObject(req, 'loginError')

        res.render('login', contextObj)
    }

    function get(req, res, next) {
        if(!req.user) return res.redirect('/login')

        listService.getLits(req.user, (err, data) => {
            if(err) return next(err)
            req.user.lst = data

            if(req.user.lst)
                req.user.lst = utils.pagination(req.user.lst, req, req.user, 8)

            res.render('user', req.user)

        })
    }

    function logOutView(req, res) {
        res.render('logout', req.user)
    }

    function signUpView(req, res) {
        if(req.user) return res.redirect('/logout')
        const contextObj = utils.setFlashMessageInCtxObject(req, 'signUpError')

        res.render('signUp', contextObj)
    }

    function logOut(req, res, next) {
        req.logout()
        res.redirect('/login')
    }

    function login(req, res, next) {
        userService.authenticate(req.body.username, req.body.password, (err, user, info) => {
            if(err) return next(err)

            if(info) {
                req.flash('loginError', info)
                return res.redirect('/login')
            }

            req.logIn(user, (err) => {
                if(err) return next(err)
                res.redirect('/user/page/1')
            })
        })
    }

    function signUp(req, res, next) {
        userService.createUser(req, (err, user, info) => {
            if(err) return next(err)

            if(info) {
                req.flash('signUpError', info)
                return res.redirect('/signUp')
            }
            req.user = user

            req.logIn(req.user, (err)=>{
                if(err) return next(err)
                res.redirect('/user/page/1')
            })
        })
    }

}

/* ------------- PASSPORT --------*/

passport.serializeUser(function (user, cb) {
    cb(null, user.username)
})

passport.deserializeUser(function (username, cb) {
    dataSource.find(username, cb)
})