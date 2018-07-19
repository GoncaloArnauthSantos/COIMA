'use strict'

module.exports = Movie

function Movie(objArray){
    const movie = objArray[0]
    const cast = objArray[1]
    this.movieId = movie.id
    this.title = movie.title
    this.vote_average = movie.vote_average
    this.release_date = movie.release_date
    this.poster_path = movie.poster_path
    this.cast = cast.cast

    const director = cast.crew.find(p => p.job === 'Director')

    this.directorName = (director) ? director.name : null
}