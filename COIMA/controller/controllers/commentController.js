'use strict'


const dataSource = require('../../model/dataSource')
const commentService = require('../services/commentService')(dataSource)

module.exports = function init() {

    return {
        addComment,
        addReply
    }

    function addComment(req, res, next) {
        const comment = {
            username : req.body.username,
            comment : req.body.comment,
            title : req.body.title,
            movieId : req.body.movieId
        }
        const ctx = { layout: false }
        Object.assign(ctx, comment)
        commentService.addCommentary(req.body, (err, data, info) =>{
            if(err) return next(err)
            ctx.id = data.id
            res.render('partials/movieComments', ctx)
        })
    }

     function addReply(req, res, next) {
        const reply = {
            username : req.body.username,
            userReplyed : req.body.replyUser,
            comment : req.body.comment,
            title : req.body.title,
            movieId : req.body.movieId
        }
        const ctx = { layout: false }
        Object.assign(ctx, reply)
        commentService.addReply(req.body, (err, data, info) => {
            if(err) return next(err)
            ctx.id = data.id
            res.render('partials/movieComments', ctx)
        })
    }
}