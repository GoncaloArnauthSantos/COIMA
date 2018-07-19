'use strict'

const cache = require('./cacheService')
const Movie = require('../../model/Entities/Movie')
const Actor = require('../../model/Entities/Actor')
const utils = require('../../utils/utils')

const pagination = {
    title: null,
    max_pages: null
}

module.exports = init

function init(dataSource) {

    const executeRequest = dataSource.executeRequestFromApi

    return {
        getHome,
        getMovies,
        'getMovie': cache.memoize(getMovie),
        'getActor': cache.memoize(getActor)
    }

    function getHome(cb) {
        cb()
    }

    function getMovies(movieObj, cb) {
        const queryString = movieObj.query
        const movieString = queryString.q
        const page = queryString.page
        const pageNumber = Number(page)

        const pathMovies = '/search/movie?api_key=940b97cffc9b5f91012e29019b60affb&query='
            + movieString + '&page=' + pageNumber

        executeRequest(pathMovies, (err, movie) => {
            if(err) return cb(err)
            if (pagination.max_pages === null && pagination.title === null){
                pagination.max_pages = movie.total_pages
                pagination.title = movieString
            } else if (movieString !== pagination.title){
                pagination.max_pages = movie.total_pages
                pagination.title = movieString
            }
            movie.movieString = movieString
            movie.page = pageNumber
            movie.max_pages = pagination.max_pages
            movie.name = "Searched results"
            cb(null, movie)
        })
    }

    function getMovie(movieObj, cb) {
        const movieId = movieObj.params.movieId
        const pathMovie = `/movie/${movieId}?api_key=940b97cffc9b5f91012e29019b60affb`
        const pathCredits = `/movie/${movieId}/credits?api_key=940b97cffc9b5f91012e29019b60affb`

        const req1 = request(pathMovie)

        const req2 = request(pathCredits)

        const reqs = [req1, req2]

        utils.parallelRequests(reqs, (err, data) => {
            if(err) return cb(err)
            cb(null, new Movie(data))
        })
    }

    function getActor(actorObj, cb) {
        const actorId = actorObj.params.actorId
        const pathActor = `/person/${actorId}?api_key=940b97cffc9b5f91012e29019b60affb&language=en-US`
        const pathActorCredits = `/person/${actorId}/movie_credits?api_key=940b97cffc9b5f91012e29019b60affb`

        const req1 = request(pathActor)

        const req2 = request(pathActorCredits)

        const reqs = [req1, req2]

        utils.parallelRequests(reqs, (err, data) => {
            if(err) return cb(err)
            cb(null, new Actor(data))
        })
    }

    function request(pathItem) {
        return callback => executeRequest(pathItem, (err, item) => {
            if(err) return callback(err)
            return callback(null, item)
        })
    }
}