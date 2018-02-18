import config from './config.js';
import getBoxOffice from './get-box-office.js';
import getMaxResults from './get-max-results.js';
import loadAllMovies from './load-all-movies.js';
import renderCharts from './render-charts.js';

import '../css/index.css';

document.addEventListener('DOMContentLoaded', function() {
    const TITLE_BASE = 'Box Office Hawk';

    var moviesField = document.querySelector('textarea[name="movies"]'),
        periodField = document.querySelector('select[name="period"]'),
        submitButton = document.getElementById('submit-button'),
        closeErrorsButton = document.querySelector('#errors button.close'),
        errorsContainer = document.getElementById('errors'),
        errorsList = errorsContainer.querySelector('ul'),
        dailyResultsContainer = document.getElementById('daily-results'),
        cumulativeResultsContainer = document.getElementById('cumulative-results');

    // actual stuff that happens on page load
    loadMoviesFromQuery();
    initializeUI();
    initializeState();

    // all teh codez
    function loadMoviesFromQuery() {
        // No need to load everything back up if the page already has state.
        if (history.state) {
            return;
        }

        var query = parseQuery();

        if (query.movies) {
            loadMovies(query.movies.map(function(movieId) {
                return {
                    movie_id: movieId,
                    title: movieId
                };
            }), query.period, true);
        }
    }

    function initializeUI() {
        var moviesSearch = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: config.getApiHost() + '/movies/search?title=%TITLE',
                wildcard: '%TITLE',
                transform: function(response) {
                    return response.results;
                }
            }
        });

        $(moviesField).tagsinput({
            itemValue: 'movie_id',
            itemText: 'title',
            typeaheadjs: {
                displayKey: 'title',
                source: moviesSearch,
                limit: 10
            }
        });

        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            loadMovies($(moviesField).tagsinput('items'), periodField.value);
        });

        closeErrorsButton.addEventListener('click', function() {
            errorsContainer.classList.add('hidden');
        });

        // Load one known good movie to ensure the API is awake.
        getBoxOffice({ title: 'Wonder Woman', movie_id: 'wonderwoman.htm' }, function(result) {
            document.querySelector('#search-form fieldset').removeAttribute('disabled');
        });
    }

    function initializeState() {
        if (history.state) {
            displayState(history.state);
        }

        window.addEventListener('popstate', function(e) {
            if (!e.state.movies) {
                return;
            }

            displayState(e.state);
        });
    }

    function displayState(state) {
        populateForm(state.movies, state.period);
        renderCharts(state.results, getMaxResults(state.period));
        updateTitle(state.movies);
    }

    function loadMovies(movies, period, refresh) {
        errorsContainer.classList.add('hidden');
        dailyResultsContainer.innerHTML = '';
        cumulativeResultsContainer.innerHTML = '';

        document.body.classList.add('loading');

        loadAllMovies(movies, function(results, dayOffset) {
            extractErrors(results);
            renderCharts(results, getMaxResults(period, dayOffset));
            history.pushState({
                'movies': movies,
                'period': period,
                'results': results
            }, '', createQuery(movies, period));
            updateTitle(movies);

            // If loading on page load, blah blah
            if (refresh) {
                populateForm(movies, period);
            }

            document.body.classList.remove('loading');
        });
    }

    function extractErrors(results) {
        var errors = [];

        for (var i = results.length - 1; i >= 0; --i) {
            if (results[i].error) {
                errors.push(results[i].error);
                results.splice(i, 1);
            }
        }

        if (errors.length > 0) {
            errorsContainer.classList.remove('hidden');
        }

        errors.forEach(function(error) {
            var errorListItem = document.createElement('li');
            errorListItem.textContent = error;
            errorsList.appendChild(errorListItem);
        });
    }

    function populateForm(movies, period) {
        $(moviesField).tagsinput('removeAll');
        movies.forEach(function(movie) {
            $(moviesField).tagsinput('add', movie);
        });
        periodField.value = period || '';
    }

    function updateTitle(movies) {
        var title = TITLE_BASE;

        var movieTitles = movies.map(function(movie) {
            return movie.title;
        });

        if (movieTitles.length > 0) {
            title += ' - ' + movieTitles.join(' / ');
        }

        document.title = title;
    }

    function parseQuery() {
        var query = {};

        location.search.slice(1).split('&').forEach(function(param) {
            var pair = param.split('=');
            switch (pair[0]) {
                case 'movies':
                    query.movies = pair[1].split(',').map(decodeURIComponent);
                    break;
                case 'period':
                    query.period = pair[1];
                    break;
            }
        });

        return query;
    }

    function createQuery(movies, period) {
        var movieIds = movies.map(function(movie) {
            return movie.movie_id;
        });

        var query = '?movies=' + movieIds.map(encodeURIComponent).join(',');

        if (period) {
            query += '&period=' + period;
        }

        return query;
    }

    function getDayAtOrdinal(results, ordinal) {
        for (var i = 0; i < results.length; ++i) {
            if (ordinal > 0 && ordinal <= results[i].box_office.length) {
                return results[i].box_office[ordinal - 1].day;
            }
        }

        return null;
    }
});
