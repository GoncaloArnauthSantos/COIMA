'use strict'


const dataSource = require('../../model/dataSource')
const inviteService = require('../services/inviteService')(dataSource)
const listService = require('../services/listService')(dataSource)
const utils = require('../../utils/utils')

module.exports = function init() {

    return {
        get,
        send,
        accept,
        deny
    }

    function get(req, res, next) {

        const req1 = callback => inviteService.getInvits(req.user, (err, data) =>{
            if(err) return callback(err)
            callback(null, data)
        })
        const req2 = callback => listService.getLits(req.user, (err, data) => {
            if(err) callback(err)
            callback(null, data)
        })

        const reqs = [req1, req2]

        utils.parallelRequests(reqs, (err, data) => {
            if(err) return next(err)
            req.user.lst = data[1]
            req.user.inv = data[0]
            res.render('invite', req.user)
        })
    }

    function send(req, res, next) {
        inviteService.sendInvite(req, (err, body, info) => {
            if(err) return next(err)
            res.send(info)
        })
    }

    function accept(req, res, next) {
        inviteService.acceptList(req, err => {
            if(err) return next(err)
            res.send(200)
        })
    }

    function deny(req, res, next) {
        inviteService.denyList(req, err => {
            if(err) return next(err)
            res.send(200)
        })
    }
}