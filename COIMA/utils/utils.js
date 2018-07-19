'use strict'

module.exports = {
    pagination,
    setFlashMessageInCtxObject,
    parallelRequests
}

function pagination(list, data, obj, itemsPerPage) {
    obj.max_pages = Math.ceil(list.length / itemsPerPage)

    const page = obj.page = data.params.page

    list = list.slice((page -1) * itemsPerPage, page * itemsPerPage)

    return list
}

function setFlashMessageInCtxObject(req, error) {
    const contextObj = {}
    const message = req.flash(error)
    if(message) contextObj.error = {message: message}
    return contextObj
}

function parallelRequests(reqs, cb) {
    const results = []
    let idx = 0
    const error = {}
    reqs.forEach((req, i) => {
        req((err, data) => {
            if(error.message)
                return
            if(err) {
                error.message = err.message
                return cb(err)
            }
            results[i] = data
            if(++idx === reqs.length)
                cb(null, results)
        })
    })
}

