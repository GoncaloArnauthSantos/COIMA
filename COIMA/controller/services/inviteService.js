'use strict'

const utils = require('../../utils/utils')

module.exports = init

function init(dataSource) {

    const options = dataSource.options
    const request = dataSource.executeRequestFromDatabase

    return {
        sendInvite,
        acceptList,
        denyList,
        getInvits
    }

    function sendInvite(data, cb) {
        const listId = data.body.listId
        const shareUser = data.body.shareUser
        const listName = data.body.listName

        request(shareUser, null, (err, user) => {
            if(err) return cb(err)
            if(user.error) return cb(null, null, "That user doesn´t  exist !!! ")
            if(user.username == data.user.username)
                return cb(null, null, "Don't send invite to yourself !!!")

            const obj = listId

            if(user.invites.find(item => item == obj))
                return cb(null, null, "You already invited this user !!")

            user.invites.push(obj)
            request(shareUser, options(user), err => {
                if(err) return cb(err)
                cb(null, null, "Invitation sended !!")
            })
        })
    }

    function getInvits(user, cb) {
        let error = {}
        let arr = []
        request(user.username, null, (err, userDoc) => {
            if(err) return cb(err)
            if(userDoc.invites == 0) return cb(null, arr)
            userDoc.invites.map(item => {
                request(item, null, (err, data) => {
                    if(error.m) return cb(error.m)
                    if(err){
                        error.m = err
                        return cb(err)
                    }
                    arr.push(data)
                    if(arr.length == userDoc.invites.length)
                        return cb(null, arr)
                })
            })

        })
    }

    function acceptList(data, cb) {
        const listId = data.body.listId
        const user = data.user

        const req1 = callback => addInEditUser(user, listId, err => {
            if(err) return callback(err)
            callback()
        })

        const req2 = callback => addInSharedList(user, listId, err => {
            if(err) return callback(err)
            callback()
        })

        const reqs = [req1, req2]
        utils.parallelRequests(reqs, (err, data) => {
            if(err) return cb(err)
            cb()
        })
    }

    function addInSharedList( user, listId, cb) {
        request(user.username, null, (err, data) => {
            if(err) return cb(err)

            const aux = data.invites.find(item => item == listId)
            if(aux)
                data.sharedList.push(aux)

            data.invites = data.invites.filter(item => item != listId)

            request(user.username, options(data), err => {
                if(err) return cb(err)
                cb()
            })
        })
    }

    function addInEditUser(user, listId, cb) {
        request(listId, null, (err, body) => {
            if(err) return cb(err)
            body.editUsers.push(user.username)
            request(listId, options(body), err => {
                if(err) return cb(err)
                cb()
            })
        })
    }

    function denyList(data, cb) {
        const listId = data.body.listId
        const user = data.user

        removeFromInvite(user, listId, err => {
            if(err) return cb(err)
            cb()
        })
    }

    function removeFromInvite(user, listId, cb) {
        request(user.username, null, (err, data) => {
            if(err) return cb(err)
            data.invites = data.invites.filter(item => item.listId != listId)
            request(user.username, options(data), err => {
                if(err) return cb(err)
                cb()
            })
        })
    }
}