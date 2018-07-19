'use strict'

const request = require('request')
const RateLimiter = require('limiter').RateLimiter
const NUMBER_OF_REQUESTS = 40
const TIME = 10000
const limiter = new RateLimiter(NUMBER_OF_REQUESTS, TIME)    //40 requests per 10 seconds, API's limit
const db = 'http://127.0.0.1:5984/movies'
const BASE_URL = 'https://api.themoviedb.org/3'

module.exports = {
    options,
    executeRequestFromDatabase,
    executeRequestFromApi,
    find
}

function executeRequestFromDatabase(documentPath, options, cb) {
    const path = db + '/' + documentPath

    request(path, options, (err, res, user) => {
        if (err) return cb(err)
        cb(null, JSON.parse(user))
    })
}

function executeRequestFromApi(documentPath, cb) {
    limiter.removeTokens(1, (err, requestsRemaining) => {
        if(err) cb(err)
        console.log('Requests remaining: ' + requestsRemaining)

        const path = BASE_URL + documentPath
        request(path, (err, res, data) => {
            if (err || res.statusCode !== 200)
                return cb({message: 'Resource Not Found!'})
            cb(null, JSON.parse(data.toString()))
        })
    })
}

function find(username, cb) {
    executeRequestFromDatabase(username, null, (err, user) => {
        if (err) return cb(err)
        cb(null, user)
    })
}

function options(user) {
    return {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(user)
    }
}