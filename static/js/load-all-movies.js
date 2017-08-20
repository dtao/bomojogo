import getBoxOffice from './get-box-office.js';

function loadAllMovies(movies, period, callback) {
    var results = [],
        maxResults = getMaxResults(period),
        dayOffset = 0;

    movies.forEach(function(movie) {
        getBoxOffice(movie, function(result) {
            // If loading page load, blah blah
            movie.title = result.title;

            results.push(result);
            if (results.length == movies.length) {
                callback(results);
            }
        });
    });
}

export default loadAllMovies;
