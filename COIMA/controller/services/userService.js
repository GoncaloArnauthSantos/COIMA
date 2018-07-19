'use strict'

module.exports = init

function init(dataSource) {

    const options = dataSource.options
    const request = dataSource.executeRequestFromDatabase
    const find = dataSource.find

    return {
        authenticate,
        createUser
    }

    function authenticate(username, password, cb) {
        find(username, (err, userBody) => {
            if (err) return cb(err)
            if (userBody.username !== username) return cb(null, null, 'Unknown User!')
            if (userBody.password !== password) return cb(null, null, 'Invalid Password!')
            cb(null, userBody)
        })
    }

    function createUser(data, cb) {
        find(data.body.username, (err, userBody) => {
            if (err) return cb(err)
            if (userBody.username === data.body.username) return cb(null, null, 'User already exists!')
            const user = {
                'username': data.body.username,
                'password': data.body.password,
                'name': data.body.name,
                'email': data.body.email,
                'list': [],
                'sharedList' : [],
                'invites' : [],
                'comments' : []
            }
            request(user.username, options(user), (err, body) => {
                if(err) return cb(err)
                cb(null, user)
            })
        })
    }
}