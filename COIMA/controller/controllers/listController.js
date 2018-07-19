'use strict'


const dataSource = require('../../model/dataSource')
const listService = require('../services/listService')(dataSource)
const utils = require('../../utils/utils')

module.exports = function init() {

    return {
        update,
        get,
        getPublics,
        deleteMovieFromList,
        deleteList,
        addList,
        addMovie,
        getSharedList
    }

    function update(req, res, next) {
        listService.updateListName(req, (err, data, info) => {
            if(err) return next(err)

            res.sendStatus(200)
        })
    }

    function get(req, res, next) {
        listService.getList(req.params.listId, (err, data, info) => {
            if(err) return next(err)
            if(info) return next(new Error(info))

            if (req.user)
                data.username = req.user.username

            data.results = utils.pagination(data.results, req, data, 8)
            res.render('favouritesList', data)
        })
    }
    function getPublics(req, res, next) {
        listService.getPubLists(req, (err, data) => {
            if(err) return next(err)
            req.user.pubList = utils.pagination(data, req, req.user, 8)
            res.render('publicLists', req.user)
        })
    }

    function deleteMovieFromList(req, res, next) {
        listService.deleteMovie( req, (err, data, info) => {
            if(err) return next(err)
            if(info) return res.send(403, info)

            res.sendStatus(200)
        })
    }

    function deleteList(req, res, next) {
        listService.deleteList( req, (err, data, info) => {
            if(err) return next(err)
            if(info) return res.send(403, info)

            res.sendStatus(200)
        })
    }

    function addList(req, res, next) {

        const lst = {
            'listId' : '',
            'name' : req.body.listName,
            'results' : []
        }

        const ctx = { layout: false }
        Object.assign(ctx, lst)

        listService.addList(req, (err, data) => {
            if(err) return next(err)
            ctx.listId = data.listId
            res.render('partials/favouriteList', ctx)
        })
    }
    function addMovie(req, res, next) {
        if(!req.body.listId)
            return res.send("Don't have list")
        listService.addMovie(req, (err, data, info) => {
            if(err) return next(err)
            return res.send(info)
        })
    }
    function getSharedList(req, res, next) {
        if(req.user.sharedList){
            listService.getShareList(req.user, (err, data) => {
                if(err) return next(err)
                req.user.shList = utils.pagination(data, req, req.user, 8)
                res.render('shareList', req.user)
            })
        }
    }
}