'use strict'

module.exports = Actor

function Actor(objArray) {
    const actor = objArray[0]
    const cast = objArray[1]
    this.actorId = actor.id
    this.name = actor.name
    this.biography = actor.biography
    this.profile_path = actor.profile_path
    this.filmography = cast.cast
}