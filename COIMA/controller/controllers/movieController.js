'use strict'


const dataSource = require('../../model/dataSource')
const movieService = require('../services/movieService')(dataSource)
const commentService = require('../services/commentService')(dataSource)
const listService = require('../services/listService')(dataSource)
const utils = require('../../utils/utils')

module.exports = function init() {

    return {
        home,
        get,
        getById,
        getActor
    }

    function home(req, res, next) {
        movieService.getHome((err, data) => {
            if(err) return next(err)
            if (req.user){
                let user = {username: req.user.username}
                res.render('homepage', user)
            }
            else
                res.render('homepage')
        })
    }

    function get(req, res, next) {
        movieService.getMovies(req, (err, data) => {
            if(err) return next(err)
            if (req.user)
                data.username = req.user.username
            res.render('searchView', data)
        } )
    }
    function getById(req, res, next) {
        req.key = '/movie/'+ req.params.movieId

        const req1 = callback => movieService.getMovie(req, (err, data) => {
            if(err) return callback(err)
            data.username = undefined
            if(req.user){
                data.username = req.user.username
                data.lst = req.user.list
            }
            data.flashMessage = utils.setFlashMessageInCtxObject(req, 'addMovieInfo')
            callback(null, data)
        })

        const req2 = callback => commentService.getCommentaries(req.params, (err, data) => {
            if(err) return callback(err)
            callback(null, data)
        })
        const req3 = callback => listService.getLits(req.user, (err, data) => {
            if(err) callback(err)
            callback(null, data)
        })
        const  req4 = callback => listService.getShareList(req.user, (err, data) => {
            if(err) callback(err)
            callback(null, data)
        })

        const reqs = [req1, req2, req3]

        if(req.user)
            reqs.push(req4)


        utils.parallelRequests(reqs, (err, data) => {
            if(err) return next(err)
            const finalData = data[0]
            finalData.comment = data[1]
            if(reqs.length > 3)
                finalData.lst = data[2].concat(data[3])
            res.render('singleMovie', finalData)
        })
    }

    function getActor(req, res, next) {
        req.key = '/actor/'+ req.params.actorId
        movieService.getActor(req, (err, data)=> {
            if(err) return next(err)
            data.username = undefined
            if (req.user)
                data.username = req.user.username
            res.render('actorView', data)
        })
    }
}