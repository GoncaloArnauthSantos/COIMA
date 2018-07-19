'use strict'

const fs = require('fs')
const cacheService = require('../controller/services/cacheService')

const endpoints = {
    '/search/movie?api_key=940b97cffc9b5f91012e29019b60affb&query=Deadpool&page=1':
        fs.readFileSync('./test/files/searchDeadpool.json').toString(),

    '/movie/293660?api_key=940b97cffc9b5f91012e29019b60affb':
        fs.readFileSync('./test/files/singleMovieDeadpool.json').toString(),

    '/person/10859?api_key=940b97cffc9b5f91012e29019b60affb&language=en-US':
        fs.readFileSync('./test/files/ryanReynoldsActor.json').toString(),

    '/movie/293660/credits?api_key=940b97cffc9b5f91012e29019b60affb':
        fs.readFileSync('./test/files/castDeadpool.json').toString(),

    '/person/10859/movie_credits?api_key=940b97cffc9b5f91012e29019b60affb':
        fs.readFileSync('./test/files/ryanReynoldsMovieList.json').toString()
}

const dataSource = {
    'executeRequestFromApi': reqToFile
}

const coima = require('../controller/services/movieService')(dataSource)

function reqToFile(path, cb) {
    const data = endpoints[path]
    if(!data) return cb(new Error('No mock file for path ' + path))
    cb(null, JSON.parse(data))
}

module.exports = {
    testSearchMovieList,
    testSingleMovie,
    testSingleActor,
    testSingleMovieFromCache,
    testSingleActorFromCache
}

function testSearchMovieList(test) {
    const toTest = {
        query: {
            page: '1',
            q: 'Deadpool'
        }
    }

    coima.getMovies(toTest, (err, movies) => {
        if (err)
            test.ifError(err)
        else{
            const array = movies.results
            test.equal(array[0].title, 'Deadpool')
            test.equal(array[1].title, 'Deadpool 2')
            test.equal(array[2].title, 'Deadpool 3')
        }
        test.done()
    })
}

function testSingleMovie(test) {
    const toTest = {
        params: {
            movieId: '293660'
        },
        key: '/movie/293660'
    }

    coima.getMovie(toTest, (err, movie) => {
        if (err)
            test.ifError(err)
        else{
            test.equal(movie.cast[0].id, 10859)
            test.equal(movie.release_date, '2016-02-09')
        }
        test.done()
    })
}

function testSingleActor(test) {
    const toTest = {
        params: {
            actorId: '10859'
        },
        key: '/actor/10859'
    }

    coima.getActor(toTest, (err, actor) => {
        if (err)
            test.ifError(err)
        else{
            test.equal(actor.name, 'Ryan Reynolds')
            test.equal(actor.filmography[0].id, 10033)
        }
        test.done()
    })
}

function testSingleMovieFromCache(test) {
    const toTest = {
        params: {
            movieId: '293660'
        },
        key: '/movie/293660'
    }

    coima.getMovie(toTest, (err, movie1) => {
        if (err) test.ifError(err)
        coima.getMovie(toTest, (err, movie2) => {
            if (err) test.ifError(err)
            test.equal(cacheService.getCount(), 2) //2 because the movie is already in cache by testSingleMovie
            test.done()
        })
    })
}

function testSingleActorFromCache(test) {
    const toTest = {
        params: {
            actorId: '10859'
        },
        key: '/actor/10859'
    }

    coima.getActor(toTest, (err, actor1) => {
        if (err) test.ifError(err)
        coima.getActor(toTest, (err, actor2) => {
            if (err) test.ifError(err)
            test.equal(cacheService.getCount(), 2) //2 because the actor is already in cache by testSingleActor
            test.done()
        })
    })
}