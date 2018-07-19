'use strict'

const fs = require('fs')

const dataSource = {
    'executeRequestFromDatabase': reqToFile,
    'options': save,
    'find': find
}

const userService = require('../controller/services/userService')(dataSource)
const listService = require('../controller/services/listService')(dataSource)

const users = {
    'joaoleitao':
        fs.readFileSync('./test/files/joao.json').toString(),
    'ricardomoreira':
        fs.readFileSync('./test/files/ricardo.json').toString(),
    'goncalosantos':
        fs.readFileSync('./test/files/goncalo.json').toString()
}

function save(user) {
    fs.writeFile(`./test/files/${user.username}.json`, JSON.stringify(user))
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
    testGetList,
    testAddList,
    testAddMovie,
    testNotSupposedToCreateUser,
    testSupposedToAuthenticate,
    testDeleteMovie,
    testDeleteList
}

function testGetList(test) {
    const username = 'joaoleitao'
    const user = JSON.parse(users[username])
    const data = {
        params: {
            listId: user.list[0].listId.toString()
        },
        user: user
    }
    listService.getList(data, (err, list) => {
        if(err) test.ifError(err)
        else
            test.equal(list.name, 'classics')
        test.done()
    })
}

function testAddList(test) {
    const data = {
        body: {
            listName: 'testMovies'
        },
        user: {
            username: 'joaoleitao'
        }
    }

    listService.addList(data, (err, user) => {
        if(err) test.ifError(err)
        else
            test.equal(user.list.find(obj => obj.name === 'testMovies').name, 'testMovies')
        test.done()
    })
}

function testAddMovie(test) {
    const username = 'joaoleitao'
    const lst = 'classics'
    const user = JSON.parse(users[username])
    const data = {
        body: {
            listId: 1511910404108,
            movieId : 41510,
            title: 'testMovie'
        },
        user: user
    }

    listService.addMovie(data, (err, obj) => {
        if(err) test.ifError(err)
        else {
            const aux = obj.user.list.find(obj => obj.name === lst)
                            .results.find(l => l.title === 'testMovie').movieId
            test.equal(aux, 41510)
        }
        test.done()
    })
}

function testNotSupposedToCreateUser(test) {
    const data = {
        body: {
            username: 'joaoleitao'
        }
    }
    userService.createUser(data, (err, user, info) => {
        if(err) test.ifError(err)
        else {
            test.equal(info, 'User already exists!')
        }
        test.done()
    })
}

function testSupposedToAuthenticate(test) {
    const username = 'joaoleitao'
    const password = '123'

    userService.authenticate(username, password, (err, user) => {
        if(err) test.ifError(err)
        else {
            test.equal(user.username, username)
            test.equal(user.password, password)
        }
        test.done()
    })
}

function testDeleteMovie(test) {
    const username = 'joaoleitao'
    const user = JSON.parse(users[username])
    const data = {
        body: {
            listId: user.list[0].listId,
            movieId: user.list[0].results[0].movieId
        },
        user: user
    }
    listService.deleteMovie(data, (err, obj) => {
        if(err) test.ifError(err)
        else
            test.equal(obj.user.list[0].results.length, 0)
        test.done()
    })
}

function testDeleteList(test) {
    const username = 'joaoleitao'
    const user = JSON.parse(users[username])
    const data = {
        body: {
            listId: user.list[0].listId
        },
        user: user
    }
    listService.deleteList(data, (err, obj) => {
        if(err) test.ifError(err)
        else
            test.equal(obj.list.length, 0)
        test.done()
    })
}