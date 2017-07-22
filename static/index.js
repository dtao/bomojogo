document.addEventListener('DOMContentLoaded', function() {
    const API_HOST = document.body.getAttribute('data-api-host');
    const TITLE_BASE = 'Box Office Hawk';
    const DAYS = [ 'Fri', 'Thu', 'Wed', 'Tue', 'Mon', 'Sun', 'Sat'];

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
                url: API_HOST + '/movies/search?title=%TITLE',
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
        chartMovies(state.results, getMaxResults(state.period));
        updateTitle(state.movies);
    }

    function loadMovies(movies, period, refresh) {
        errorsContainer.classList.add('hidden');
        dailyResultsContainer.innerHTML = '';
        cumulativeResultsContainer.innerHTML = '';

        document.body.classList.add('loading');

        var results = [],
            maxResults = getMaxResults(period),
            dayOffset = 0;

        movies.forEach(function(movie) {
            searchMovie(movie, function(result) {
                // If loading page load, blah blah
                movie.title = result.title;

                results.push(result);
                if (results.length == movies.length) {
                    extractErrors(results);
                    dayOffset = alignResults(results);
                    chartMovies(results, maxResults + dayOffset);
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
                }
            });
        });
    }

    function searchMovie(movie, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', API_HOST + '/movies/' + encodeURIComponent(movie.movie_id) + '/boxoffice');
        xhr.addEventListener('load', function() {
            var data;
            try {
                data = JSON.parse(xhr.responseText);
            } catch (e) {
                data = {
                    'error': 'No luck finding "' + movie.title + '" :('
                };
            }
            callback(data);
        });
        xhr.send();
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

    function alignResults(results) {
        var dayOffset = getDayOffset(results);

        results.forEach(function(result) {
            padBoxOffice(result, dayOffset);
        });

        return dayOffset;
    }

    function getDayOffset(results) {
        var maxDayOffset = 0;

        results.forEach(function(result) {
            if (result.box_office.length == 0) {
                return;
            }
            maxDayOffset = Math.max(maxDayOffset, DAYS.indexOf(result.box_office[0].day));
        });

        return maxDayOffset;
    }

    function padBoxOffice(result, dayOffset) {
        if (result.box_office.length == 0) {
            return;
        }

        var currentDay = DAYS.indexOf(result.box_office[0].day);

        while (currentDay++ < dayOffset) {
            result.box_office.unshift({
                day: DAYS[currentDay],
                date: null,
                rank: null,
                gross: null,
                theaters: null,
                cumulative: null
            });
        }
    }

    function chartMovies(results, maxResults) {
        Highcharts.chart('daily-results', getChartOptions(
            'Daily box office', results, 'gross', maxResults));

        Highcharts.chart('cumulative-results', getChartOptions(
            'Cumulative box office', results, 'cumulative', maxResults));
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

    function getMaxResults(period) {
        if (!period) {
            return null;
        }

        try {
            var parsed = period.match(/^(\d+)([dw])$/),
                value = Number(parsed[1]),
                unit = parsed[2];
        } catch (e) {
            return null;
        }

        switch (unit) {
            case 'w':
                return value * 7;
            case 'd':
            default:
                return value;
        }
    }

    function getChartOptions(title, results, property, maxResults) {
        return {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: title
            },
            xAxis: {
                title: {
                    'text': 'Weeks in release'
                },
                labels: {
                    formatter: function() {
                        var week = Math.floor(this.value / 7) + 1;
                        return formatFriday(week);
                    }
                },
                tickPositioner: function() {
                    var positions = [];

                    var largestResult = results.reduce(function(a, b) {
                        return a.box_office.length > b.box_office.length ? a : b;
                    }, results[0]);

                    largestResult.box_office.forEach(function(daily, i) {
                        if (daily.day == 'Fri') {
                            positions.push(i + 1);
                        }
                    });

                    // Don't display *too* many data labels (e.g. when using
                    // "Forever" as the time period).
                    if (positions.length > 10) {
                        positions = positions.filter(function(pos, i) {
                            return i % 2 == 0;
                        });
                    }

                    return positions;
                }
            },
            yAxis: {
                title: {
                    text: title
                }
            },
            plotOptions: {
                line: {
                    marker: {
                        enabled: false
                    }
                },
                series: {
                    pointStart: 1
                }
            },
            legend: {
                labelFormatter: function() {
                    return '<a href="' + results[this.index].href +
                        '" target="_blank">' + this.name + '</a>';
                },
                useHTML: true
            },
            series: results.map(function(result) {
                var boxOffice = result.box_office;

                if (maxResults) {
                    boxOffice = boxOffice.slice(0, maxResults);
                }

                return {
                    type: 'line',
                    name: result.title,
                    data: boxOffice.map(function(daily) {
                        return [daily.day, daily[property]];
                    })
                };
            }),
            credits: {
                enabled: false
            }
        };
    }

    function getDayAtOrdinal(results, ordinal) {
        for (var i = 0; i < results.length; ++i) {
            if (ordinal > 0 && ordinal <= results[i].box_office.length) {
                return results[i].box_office[ordinal - 1].day;
            }
        }

        return null;
    }

    function formatFriday(week) {
        var suffix;
        switch (week % 10) {
            case 1:
                suffix = 'st';
                break;
            case 2:
                if (week % 100 != 12) {
                    suffix = 'nd';
                }
                break;
            case 3:
                if (week % 100 != 13) {
                    suffix = 'rd';
                }
                break;
        }

        if (!suffix) {
            suffix = 'th';
        }

        return week + suffix + ' Friday';
    }
});
