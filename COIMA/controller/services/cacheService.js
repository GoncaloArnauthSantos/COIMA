'use strict'

module.exports = {
    memoize,
    getCount
}

const countObj = {}

function getCount() {
    return countObj.count
}

function memoize(fn) {
    let cache = {}
    let count = 0
    return function (x, callBack) {
        const params = x.key
        if(params in cache) {
            countObj.count = ++count
            return callBack(null, cache[params])
        }
        fn(x,(err,obj) => {
            if(err) return callBack(err)
            cache[params] = obj
            callBack(null, obj)
        })
    }
}