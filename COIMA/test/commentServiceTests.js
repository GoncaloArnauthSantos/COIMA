'use strict'

const fs = require('fs')

const dataSource = {
    'executeRequestFromDatabase': reqToFile,
    'options': save,
    'find': find
}

const commentService = require('../controller/services/commentService')(dataSource)

const users = {
    'joaoleitao':
        fs.readFileSync('./files/joao.json').toString(),
    '256591':
        fs.readFileSync('./files/256591.json').toString()
}

function save(user) {
    fs.writeFile(`./files/${user.username}.json`, JSON.stringify(user))
}

function reqToFile(path, options, cb) {
    const data = users[path]
    if(!data) return cb(new Error('No mock file for path ' + path))
    cb(null, JSON.parse(data))
}

function find(path, cb) {
    reqToFile(path, null, (err, user) => {
        if(err) return cb(err)
        cb(null, user)
    })
}

module.exports = {
    testAddReply,
    testGetCommentaries,
    testAddCommentary
}

function testGetCommentaries(test) {
    const data = {
        movieId: '256591'
    }
    commentService.getCommentaries(data, (err, body) => {
        if(err) test.ifError(err)
        else
            test.equal(body.comments[0].comment, 'test1')
        test.done()
    })
}

function testAddCommentary(test) {
    const data = {
        username: 'joaoleitao',
        comment: 'testAddCommentary',
        title: 'Focus',
        movieId: 256591
    }
    commentService.addCommentary(data, (err, body) => {
        if(err) test.ifError(err)
        else {
            const movie = body[0]
            const user = body[1]

            test.equal('testAddCommentary', movie.comments.find(obj => obj.comment == 'testAddCommentary').comment)
            test.equal('testAddCommentary', user.comments.find(obj => obj.comment == 'testAddCommentary').comment)
        }
        test.done()
    })
}

function testAddReply(test) {
    const data = {
        replyId: 1514482594640,     //id from commentary with the comment 'test1', first of the array
        replyUser: 'joaoleitao',
        username: 'joaoleitao',
        comment: 'testAddCommentaryReply',
        title: 'Focus',
        movieId: 256591
    }
    commentService.addReply(data, (err, body) => {
        if(err) test.ifError(err)
        else {
            const user = body[0]
            const movie = body[1]
            const commentaryInMovie = body[2]

            test.equal('testAddCommentaryReply', user.comments[0].responses.find(obj => obj.comment == 'testAddCommentaryReply').comment)
            test.equal('testAddCommentaryReply', movie.comments[0].responses.find(obj => obj.comment == 'testAddCommentaryReply').comment)
            test.equal('testAddCommentaryReply', commentaryInMovie.comments.find(obj => obj.comment == 'testAddCommentaryReply').comment)
        }
        test.done()
    })
}