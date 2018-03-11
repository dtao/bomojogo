import $ from 'jquery';
import Bloodhound from 'corejs-typeahead';

import config from './config.js';
import createMatchup from './create-matchup.js';
import getBoxOffice from './get-box-office.js';
import getMatchups from './get-matchups.js';
import getMaxResults from './get-max-results.js';
import loadAllMovies from './load-all-movies.js';
import renderCharts from './render-charts.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/index.css';

// Expose jQuery for other libraries (*ahem* tagsinput)
window.jQuery = $;

document.addEventListener('DOMContentLoaded', function() {
    const TITLE_BASE = 'Box Office Hawk';

    var moviesField = document.querySelector('textarea[name="movies"]'),
        periodField = document.querySelector('select[name="period"]'),
        submitButton = document.getElementById('submit-button'),
        // saveForm = document.getElementById('save-form'),
        closeErrorsButton = document.querySelector('#errors button.close'),
        errorsContainer = document.getElementById('errors'),
        errorsList = errorsContainer.querySelector('ul'),
        matchupsContainer = document.getElementById('matchups'),
        matchupsList = document.getElementById('matchups-list'),
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

        closeErrorsButton.addEventListener('click', hideErrors);

        // saveForm.addEventListener('submit', function(e) {
        //     e.preventDefault();

        //     var matchup = {
        //         title: saveForm.querySelector('[name="title"]').value,
        //         description: saveForm.querySelector('[name="description"]').value,
        //         movies: $(moviesField).tagsinput('items').map(
        //             function(movie) {
        //                 return movie.movie_id;
        //             }).join(','),
        //         period: periodField.value
        //     };

        //     document.body.classList.add('loading');
        //     createMatchup(matchup, function(result) {
        //         if (result.error) {
        //             displayErrors([result.error]);
        //             return;
        //         }

        //         window.location = '/matchup/' + result.slug;
        //     });
        // });

        // Load one known good movie to ensure the API is awake.
        document.body.classList.add('loading');
        getBoxOffice({ title: 'Wonder Woman', movie_id: 'wonderwoman.htm' }, function(result) {
            document.body.classList.remove('loading');

            if (result.errors) {
                displayErrors(["Oh no! The API isn't responding :("]);
                return;
            }

            document.querySelector('#search-form fieldset').removeAttribute('disabled');
        });

        getMatchups(function(matchups) {
            showMatchups(matchups);
        });
    }

    function initializeState() {
        if (history.state) {
            displayState(history.state, true);
        }

        window.addEventListener('popstate', function(e) {
            if (!e.state.movies) {
                return;
            }

            displayState(e.state, true);
        });
    }

    function displayState(state, refresh) {
        if (refresh) {
            populateForm(state.movies, state.period);
        }
        renderCharts(state.results, getMaxResults(state.period, state.dayOffset || 0));
        updateTitle(state.movies);
        document.body.classList.add('showing-box-office');
    }

    function showMatchups(matchups) {
        if (matchups.length > 0) {
            matchupsContainer.removeAttribute('hidden');
        }

        matchups.forEach(function(matchup) {
            var item = document.createElement('a');
            item.classList.add('list-group-item');
            item.classList.add('list-group-item-action');
            item.setAttribute('href', '/matchup/' + matchup.slug);
            item.textContent = matchup.title;
            matchupsList.appendChild(item);
        });
    }

    function loadMovies(movies, period, refresh) {
        hideErrors();
        dailyResultsContainer.innerHTML = '';
        cumulativeResultsContainer.innerHTML = '';

        document.body.classList.add('loading');

        loadAllMovies(movies, function(results, dayOffset) {
            extractErrors(results);
            displayState({
                movies: movies,
                period: period,
                dayOffset: dayOffset,
                results: results
            }, refresh);
            history.pushState({
                'movies': movies,
                'period': period,
                'results': results
            }, '', createQuery(movies, period));
            // saveForm.removeAttribute('hidden');

            document.body.classList.remove('loading');
        });
    }

    function extractErrors(results) {
        var errors = [];

        for (var i = results.length - 1; i >= 0; --i) {
            if (results[i].errors) {
                errors.push.apply(errors, (results[i].errors));
                results.splice(i, 1);
            }
        }

        displayErrors(errors);
    }

    function hideErrors() {
        errorsContainer.setAttribute('hidden', '');
    }

    function displayErrors(errors) {
        if (errors.length > 0) {
            errorsContainer.removeAttribute('hidden');
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
