import getMaxResults from './get-max-results.js';
import loadAllMovies from './load-all-movies.js';
import makeRequest from './make-request.js';
import renderCharts from './render-charts.js';

document.addEventListener('DOMContentLoaded', function() {
    var titleElement = document.getElementById('title'),
        descriptionElement = document.getElementById('description');

    document.body.classList.add('loading');

    makeRequest('GET', '/matchups' + location.pathname, function(data) {
        var movies = data.movies.map(function(movieId) {
            return {
                movie_id: movieId,
                title: movieId
            };
        });

        loadAllMovies(movies, function(results, dayOffset) {
            displayMatchup(data, results, dayOffset);
            document.body.classList.remove('loading');
        });
    });

    function displayMatchup(matchupData, results, dayOffset) {
        titleElement.textContent = matchupData.title;
        descriptionElement.innerHTML = marked(matchupData.description);
        renderCharts(results, getMaxResults(matchupData.period, dayOffset));
    }
});
