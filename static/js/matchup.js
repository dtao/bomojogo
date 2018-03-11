import gravatarUrl from 'gravatar-url';
import marked from 'marked';

import getMaxResults from './get-max-results.js';
import loadAllMovies from './load-all-movies.js';
import makeRequest from './make-request.js';
import renderCharts from './render-charts.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/index.css';

document.addEventListener('DOMContentLoaded', function() {
    const TITLE_BASE = 'Box Office Hawk';

    var titleElement = document.getElementById('title'),
        detailsElement = document.getElementById('matchup-details'),
        createdElement = detailsElement.querySelector('small'),
        descriptionElement = document.getElementById('description');

    document.body.classList.add('loading-matchup');

    var slug = location.pathname.split('/').pop();
    makeRequest('GET', '/matchups/' + slug, function(data) {
        createdElement.textContent = new Date(data.created).toLocaleString();

        if (data.avatar) {
            var img = document.createElement('img');
            img.classList.add('avatar');
            img.setAttribute('src', data.avatar);
            detailsElement.appendChild(img);
        }

        var movies = data.movies.map(function(movieId) {
            return {
                movie_id: movieId,
                title: movieId
            };
        });

        loadAllMovies(movies, function(results, dayOffset) {
            displayMatchup(data, results, dayOffset);
            document.body.classList.remove('loading-matchup');
        });
    });

    function displayMatchup(matchupData, results, dayOffset) {
        document.title = matchupData.title + ' - ' + TITLE_BASE;
        titleElement.textContent = matchupData.title;
        descriptionElement.innerHTML = marked(matchupData.description);
        renderCharts(results, getMaxResults(matchupData.period, dayOffset));

        // Update social sharing buttons if present.
        var sharingButtons = document.querySelector(
            '.sharethis-inline-share-buttons');
        if (sharingButtons) {
            sharingButtons.setAttribute('data-title', matchupData.title);
        }
    }
});
