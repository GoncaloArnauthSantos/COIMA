'use strict'

const utils = require('../../utils/utils')

module.exports = init


function init(dataSource) {

    const options = dataSource.options
    const request = dataSource.executeRequestFromDatabase
    const lstTableName = "PubList"

    return {
        addList,
        addMovie,
        getList,
        deleteMovie,
        deleteList,
        updateListName,
        initDB,
        getPubLists,
        getLits,
        getShareList
    }

    function initDB() {
        const obj = {
            id : lstTableName,
            lists : []
        }
        request(lstTableName, null, (err, data) => {
            if(err) return
            if(data.error){
                request(lstTableName, options(obj), err => {})
            }
        })
    }
    function addList(data, cb) {

        const lstName = data.body.listName
        const p = data.body.public

        const list = {
            'listId': new Date().valueOf(),
            'name': lstName,
            'results': [],
            'public': p,
            'editUsers': [],
            'creatorId': data.user.username
        }

        const req1 = callback => addListInUser(data, list, err => {
            if(err) return callback(err)
            return callback()
        })

        const req2 = callback => addListInDB( list, (err, data) => {
            if(err) return callback(err)
            return callback(null, data)
        })

        let reqs = [req1, req2]

        utils.parallelRequests(reqs, (err, data) => {
            if(err) return cb(err)
            cb(null, data[1])
        })
    }

    function addListInUser(data, list, cb) {
        const obj = list.listId

        request(data.user.username, null, (err, user) => {
            if (err) return cb(err)
            user.list.push(obj)
            request(data.user.username, options(user), err => {
                if(err) return cb(err)
                cb()
            })
        })
    }

    function addListInDB(list, cb) {
        if(list.public === 'true')
            request(lstTableName, null, (err, data) => {
                if(err) return cb(err)
                data.lists.push(list.listId)
                request(lstTableName, options(data), err => {
                    if(err) return cb(err)
                    cb(null, data)
                })
            })

        request(list.listId, options(list), err => {
            if (err) return cb(err)
            cb(null, list)
        })
    }

    function addMovie(data, cb) {
        const title = data.body.title
        const listId = data.body.listId
        const obj = {
            movieId: data.body.movieId,
            title: title,
            poster_path: data.body.posterPath ? data.body.posterPath : null
        }

        checkMovie(listId, title, (err, data) => {
            if(err) return cb(err)
            if(data)
                addMovieInDbList(listId, obj, err => {
                    if(err) return cb(err)
                    cb(null, null, "Movie Added to List")
                })
            else cb(null, null, 'Warning! It\'s already in that list!')
        })
    }

    function checkMovie(lstId, title, cb){
        request(lstId, null, (err, data) => {
            if(err) return cb(err)
            if( data.results.find(item => item.title == title) )
                return cb(null, false)
            cb(null, true)
        })
    }

    function addMovieInDbList(listId, movie, cb){
        request(listId, null, (err, data) => {
            if(err) return cb(err)
            data.results.push(movie)
            request(listId, options(data), err => {
                if(err) return cb(err)
                cb()
            })
        })
    }

    function getList(listId, cb) {
        request(listId, null, (err, data) => {
            if(err) return cb(err)
            if(data.error) return cb(null, null, 'List id not found')
            cb(null, data)

        })
    }
    function getLits(user, cb) {
        let lst =[]
        let error = {}
        if(!user || user.list.length == 0 ) return cb(null, lst)
        user.list.map(item => {
            request(item, null, (err, data) => {
                if(error.m) return cb(error.m)
                if(err){
                    error.m = err
                    return cb(err)
                }
                lst.push(data)
                if(lst.length == user.list.length)
                    return cb(null, lst)
            })
        })
    }

    function getShareList(user, cb) {
        let error = {}
        let arr = []
        request(user.username, null, (err, userDoc) => {
            if(err) return cb(err)
            if(userDoc.sharedList.length == 0) return cb(null, arr)
            userDoc.sharedList.map(item => {
                request(item, null, (err, data) => {
                    if(error.m) return cb(error.m)
                    if(err){
                        error.m = err
                        return cb(err)
                    }
                    arr.push(data)
                    if(arr.length == userDoc.sharedList.length)
                        return cb(null, arr)
                })
            })
        })
    }

    function deleteMovie(data, cb) {

        const user = data.user
        const listId = data.body.listId
        const movieId = data.body.movieId

        request(listId, null, (err, data) => {
            if(err) return cb(err)
            if( !data.editUsers.find(item => item === user.username) && user.username !== data.creatorId)
                return cb(null, null, "You can´t change this List !!")

            data.results = data.results.filter(item => item.movieId !== movieId)
            request(listId, options(data), err => {
                if(err) return cb(err)
                cb()
            })
        })
    }

    function deleteList(data, cb) {

        const user = data.user
        const listId = data.body.listId

        request(listId, null, (err, data) => {
            if(err) return cb(err)
            if( data.creatorId !== user.username)
                return cb(null, null, "You aren't the creator of this List !!")

            const req1 = callback => deleteListInUser(user, listId, err => {
                if(err) return callback(err)
                callback()
            })

            const req2 = callback => deleteListInBd(listId, err => {
                if(err) return callback(err)
                callback()
            })

            const req3 = callback => deleteListInSharedUsers(listId, err => {
                if(err) return callback(err)
                callback()
            })

            const reqs = [req1, req2, req3]
            utils.parallelRequests(reqs, err =>{
                if(err) return cb(err)
                cb()
            })
        })
    }

    function deleteListInSharedUsers(listId, cb) {
        let error = {}
        let arr = []

        request(listId, null, (err, listDoc) => {
            if(err) return cb(err)
            if(listDoc.editUsers.length == 0) return cb(null, arr)
            listDoc.editUsers.map(item => {
                request(item, null, (err, data) => {
                    if(error.m)
                        return cb(error.m)
                    if(err){
                        error.m = err
                        return cb(err)
                    }
                    data.sharedList = data.sharedList.filter(item => item != listId)
                    request(item, options(data), err => {
                        if(err) return cb(err)
                        cb()
                    })
                })
            })
        })
    }

    function deleteListInUser(user, listId, cb) {
        request(user.username, null, (err, user) => {
            if (err) return cb(err)
            user.list = user.list.filter(item => item != listId )
            request(user.username, options(user), err => {
                if(err) return cb(err)
                cb()
            })
        })
    }

    function deleteListInBd(lisId, cb) {

        request(lisId, null, (err, data) => {
            if(err) return cb(err)
            const opt = {
                method: "DELETE",
            }
            if(data.public == 'true')
                deleteListInPublicDb(lisId, err => {
                    if(err) return cb(err)
                    cb()
                })

            const path = `${lisId}?rev=${data._rev}`
            request(path, opt, err => {
                if(err) return cb(err)
                cb()
            })
        })
    }

    function deleteListInPublicDb(lisId, cb) {
        request(lstTableName, null, (err, data) =>{
            if(err) return cb(err)
            data.lists = data.lists.filter(item => item != lisId)
            request(lstTableName, options(data), err => {
                if(err) return cb(err)
                cb()
            })
        })
    }

    function updateListName(data, cb) {
        const newLstName = data.body.newListName
        const listId = data.body.listId

        updateListNameInLst(listId, newLstName, err => {
                if(err) return cb(err)
                cb()
            })
    }

    function updateListNameInLst(listId, newLstName, cb) {

        request(listId, null, (err, body) => {
            if(err) return cb(err)
            body.name = newLstName
            request(listId, options(body), err => {
                if(err) return cb(err)
                cb()
            })
        })
    }

    function getPubLists(data, cb) {
        const user = data.user
        let count = 0
        let arr = []
        let error = {}
        request(lstTableName, null, (err, document) => {
            if(document.lists.length == 0)
                return cb(null, arr)
            document.lists.map( item => {
                getList(item, (err, data) => {
                    if(error.m)
                        return cb(error.m)
                    if(err){
                        error.m = err
                        return cb(err)
                    }
                    if(data.creatorId != user.username )
                        arr.push(data)
                    count++

                    if(count == document.lists.length && !error.m)
                        return cb(null, arr)
                })
            })
        })
    }
}
