function openNav() {
    document.getElementById("mySidenav").style.width = "500px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function acceptList(listId) {
    const data = `listId=${listId}`
    const row = document.getElementById(`row${listId}`)
    httpRequest('POST', '/acceptList', data, err => {
        if(err) return alert(err)
        alert('List accept')
        row.parentNode.removeChild(row)
    })
}

function denyList(listId) {
    const data = `listId=${listId}`
    const row = document.getElementById(`row${listId}`)
    httpRequest('POST', '/denyList', data, err => {
        if(err) return alert(err)
        alert('List Deny')
        row.parentNode.removeChild(row)
    })
}

window.onload = function() {
    let userComment
    let currentUser
    let currentMovieId
    let currentTitle
    let state = true;
    let id = 1
    let commentId = 1
    let responseId = 1
    let commentList
    let response
    let listRow
    let editButton
    let deleteButton
    let editRequestButton
    let toShowDiv

    commentList = document.getElementById('comments-list')
    response = document.getElementById('response')
    listRow = document.getElementById('lstRow')

    document
        .querySelectorAll('.comments')
        .forEach(div => {
            const btn = div.querySelector('#btn')
            userComment = div.querySelector('.comment-text-area')
            currentUser = div.querySelector('.current-User')
            currentMovieId = div.querySelector('.current-MovieId')
            currentTitle = div.querySelector('.current-Title')
            btn.addEventListener('click', () => {
                if(userComment.value) {
                    const data = `username=${currentUser.value}&movieId=${currentMovieId.value}&comment=${userComment.value}&title=${currentTitle.value}`
                    httpRequest('POST', '/comments', data, (err, body) => {
                        if (err) return alert(err)
                        alert('Comment Submitted!')
                        const bodyHTML = document.createRange().createContextualFragment(body)
                        const toAdd = bodyHTML.childNodes[0] //div to add to HTML
                        toAdd.id = '' + toAdd.id + '' + commentId
                        const replyButton = toAdd.childNodes[7]
                        replyButton.id = '' + replyButton.id + '' + commentId
                        const writeCommentButton = toAdd.childNodes[9]
                        writeCommentButton.id = '' + writeCommentButton.id + '' + commentId
                        const toShowDiv = toAdd.childNodes[11]
                        toShowDiv.id = '' + toShowDiv.id + '' + commentId
                        commentId++
                        showEditTextArea(replyButton,toShowDiv)
                        replyComment(writeCommentButton, toAdd)
                        commentList.appendChild(toAdd)
                    })
                }
            })
        })

    document
        .querySelectorAll('#chat')
        .forEach(div => {
                div.id = ''+div.id+''+commentId
                const replyButton = div.childNodes[7]
                replyButton.id = '' + replyButton.id + '' + commentId
                const writeCommentButton = div.childNodes[9]
                writeCommentButton.id = '' + writeCommentButton.id + '' + commentId
                const toShowDiv = div.childNodes[11]
                toShowDiv.id = '' + toShowDiv.id + '' + commentId
                commentId++
                showEditTextArea(replyButton,toShowDiv)
                replyComment(writeCommentButton, div)
        })

    document
        .querySelectorAll('#response')
        .forEach(replyDiv => {
            replyDiv.id = ''+replyDiv.id+''+commentId
            responseId++
        })

    document
        .querySelectorAll('#tableItem')
        .forEach(div => {
            const btn = div.querySelector('#btnDelete')
            const deleteMovie = div.querySelector('.current-deleteMovie')
            const movieList = div.querySelector('.current-List')
            btn.addEventListener('click', () => {
                const data = `listId=${movieList.value}&movieId=${deleteMovie.value}`
                httpRequest('DELETE', '/deleteMovie', data, (err, body) => {
                    if (err) return alert(err)
                    alert('Movie Deleted!')
                    div.parentNode.removeChild(div)
                })
            })
        })

    document
        .querySelectorAll('#addMovie')
        .forEach(div => {
            const btn = div.querySelector('#addMovieBtn')
            const movieId = div.querySelector('.current-movieId')
            const title = div.querySelector('.current-title')
            const poster = div.querySelector('.current-poster')
            btn.addEventListener('click', () => {
                const listId = div.querySelector('#current-lstId')
                const data = `movieId=${movieId.value}&title=${title.value}&listId=${listId.value}&posterPath=${poster.value}`
                httpRequest('POST', '/addMovie', data, (err, body) => {
                    if(err) return alert(err)
                    alert(body)
                })
            })
        })

    document
        .querySelectorAll('#shareList')
        .forEach(div => {
            const btn = div.querySelector('#shareListBtn')
            btn.addEventListener('click', () => {
                let idx = div.querySelector('#current-lstId').selectedIndex
                const listId = div.querySelector('#current-lstId')
                const listName = div.querySelector('#current-lstId').options[idx].text
                const shareUser = div.querySelector('#shareUser')
                const data =`listId=${listId.value}&shareUser=${shareUser.value}&listName=${listName}`
                httpRequest('POST', '/invite', data, (err, body) => {
                    if(err) return alert(err)
                    alert(body)
                })
            })
        })

    /**
     * Assigns specific ID to certain parts of the new div to add and
     */
    document
        .querySelectorAll('#lstpainel')
        .forEach(div => {
            const btn = div.querySelector('#addLstbtn')
            btn.addEventListener('click', () => {
                const lstName = div.querySelector('#lstName')
                const pbl = div.querySelector('#pbl')
                const data = `listName=${lstName.value}&public=${pbl.checked}`
                if(lstName.value)
                    httpRequest('POST', '/addLst', data, (err, body) => {
                        if(err) return alert(err)
                        alert('List Added!')
                        const bodyHTML = document.createRange().createContextualFragment(body)
                        const toAdd = bodyHTML.childNodes[0] //div to add to HTML
                        getSpecificElements(toAdd)

                        toAdd.id = '' + toAdd.id + '' + id
                        editButton.id = "" + editButton.id + '' + id
                        toShowDiv.id = ""+toShowDiv.id + "" + id
                        showEditTextArea(editButton, toShowDiv)
                        sendListNewName(editRequestButton, toAdd)
                        deleteUserList(deleteButton, toAdd)

                        id++
                        listRow.appendChild(toAdd)
                    })
            })
        })

    document
        .querySelectorAll('#deleteLst')
        .forEach(div => {
                getSpecificElements(div)
                div.id = ""+div.id+""+id
                editButton.id = ""+editButton.id + "" + id
                toShowDiv.id = ""+toShowDiv.id + "" + id
                showEditTextArea(editButton, toShowDiv)
                sendListNewName(editRequestButton, div)
                deleteUserList(deleteButton, div)
                id++
        })

    function showEditTextArea(editButton,div){
        editButton.onclick = function () {
            if (state){
                document.getElementById(''+div.id).style.display = 'inline'
                state = false
            }
            else {
                document.getElementById(''+div.id).style.display = 'none'
                state = true
            }
        }
    }

    function replyComment(writeCommentButton, toAdd){
        writeCommentButton.onclick = function() {
            const currentReplyUser = toAdd.childNodes[1]
            const currentReplyId = toAdd.childNodes[3]
            const userReply = toAdd.childNodes[11].childNodes[1].childNodes[1]

            const data =  `username=${currentUser.value}&movieId=${currentMovieId.value}&comment=${userReply.value}&title=${currentTitle.value}&replyUser=${currentReplyUser.value}&replyId=${currentReplyId.value}`
            if(userReply.value) {
                httpRequest('POST', '/reply', data, (err, body) => {
                    if (err) return alert(err)
                    alert('Reply Submitted!')

                    const bodyHTML = document.createRange().createContextualFragment(body)
                    const replytoAdd = bodyHTML.childNodes[0] //div to add to HTML
                    replytoAdd.id = '' + replytoAdd.id + '' + responseId
                    const replyButton = replytoAdd.childNodes[7]
                    replyButton.id = '' + replyButton.id + '' + responseId
                    const writeCommentButton = replytoAdd.childNodes[9]
                    writeCommentButton.id = '' + writeCommentButton.id + '' + responseId
                    const toShowDiv = replytoAdd.childNodes[11]
                    toShowDiv.id = '' + toShowDiv.id + '' + responseId
                    responseId++
                    showEditTextArea(replyButton,toShowDiv)
                    replyComment(writeCommentButton, replytoAdd)
                    document.getElementById(''+toAdd.childNodes[11].id).style.display = 'none'
                    state = true
                    let aux = toAdd.nextSibling
                    toAdd.appendChild(replytoAdd)
                })
            }

        }
    }

    function sendListNewName(editRequestButton, div){
        editRequestButton.onclick = function () {
            const listId = div.childNodes[3].childNodes[7].childNodes[3].childNodes[3]
            const newName = div.childNodes[3].childNodes[7].childNodes[1].childNodes[1]
            const data = `listId=${listId.value}&newListName=${newName.value}`
            httpRequest('POST', '/updateListName', data, err => {
                if(err) return alert(err)
                alert('List name changed !')
                div.childNodes[3].childNodes[5].innerHTML = newName.value
                document.getElementById(''+toShowDiv.id).style.display = 'none'
                state = true
            })
        }
    }

    function deleteUserList(deleteButton, div){
        deleteButton.onclick = function () {
            const listId = div.childNodes[3].childNodes[7].childNodes[3].childNodes[3]
            const data = `listId=${listId.value}`
            httpRequest('DELETE', '/deleteList', data, err => {
                if(err) return alert(err)
                alert('List Deleted!')
                id--
                div.parentNode.removeChild(div)

            })
        }
    }

    function getSpecificElements(div){
        editButton = div.childNodes[3].childNodes[1]
        deleteButton = div.childNodes[3].childNodes[3]
        editRequestButton = div.childNodes[3].childNodes[7].childNodes[3].childNodes[1]
        toShowDiv = div.childNodes[3].childNodes[7]
    }
}

function httpRequest(method, path, data, cb) {
    const xhr = new XMLHttpRequest()
    xhr.open(method, path, true)

    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            if(xhr.status === 200)
                cb(null, xhr.responseText)
            else
                cb(new Error( xhr.responseText))
        }
    }
    if (data != null)
        xhr.send(data);
    else
        xhr.send();
}