document.addEventListener('DOMContentLoaded', function() {
    const TITLE_BASE = 'Box Office Hawk';
    const DAYS = [ 'Fri', 'Thu', 'Wed', 'Tue', 'Mon', 'Sun', 'Sat'];

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
                url: '/search?title=%TITLE',
                wildcard: '%TITLE',
                transform: function(response) {
                    return response.results;
                }
            }
        });

        $('textarea[name="movies"]').tagsinput({
            itemValue: 'movie_id',
            itemText: 'title',
            typeaheadjs: {
                displayKey: 'title',
                source: moviesSearch,
                limit: 10
            }
        });

        document.getElementById('submit-button').addEventListener('click', function(e) {
            e.preventDefault();

            var movies = $('textarea[name="movies"]').tagsinput('items');
            var period = document.querySelector('select[name="period"]').value;
            loadMovies(movies, period);
        });

        document.querySelector('#errors button.close').addEventListener('click', function() {
            document.getElementById('errors').classList.add('hidden');
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
        document.getElementById('errors').classList.add('hidden');
        document.getElementById('daily-results').innerHTML = '';
        document.getElementById('cumulative-results').innerHTML = '';

        document.body.classList.add('loading');

        var results = [];
        movies.forEach(function(movie) {
            searchMovie(movie, function(result) {
                // If loading page load, blah blah
                movie.title = result.title;

                results.push(result);
                if (results.length == movies.length) {
                    extractErrors(results);
                    alignResults(results);
                    chartMovies(results, getMaxResults(period));
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
        xhr.open('GET', '/boxoffice?movie_id=' + encodeURIComponent(movie.movie_id));
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

        var errorsContainer = document.getElementById('errors'),
            errorList = errorsContainer.querySelector('ul');

        if (errors.length > 0) {
            errorsContainer.classList.remove('hidden');
        }

        errors.forEach(function(error) {
            var errorListItem = document.createElement('li');
            errorListItem.textContent = error;
            errorList.appendChild(errorListItem);
        });
    }

    function alignResults(results) {
        var earliestDay = getEarliestDay(results);

        results.forEach(function(result) {
            padBoxOffice(result, earliestDay);
        });
    }

    function getEarliestDay(results) {
        var earliestDay = 0;

        results.forEach(function(result) {
            earliestDay = Math.max(earliestDay, DAYS.indexOf(result.box_office[0].day));
        });

        return earliestDay;
    }

    function padBoxOffice(result, earliestDay) {
        var currentDay = DAYS.indexOf(result.box_office[0].day);

        while (currentDay++ < earliestDay) {
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
        $('textarea[name="movies"]').tagsinput('removeAll');
        movies.forEach(function(movie) {
            $('textarea[name="movies"]').tagsinput('add', movie);
        });
        if (period) {
            document.querySelector('select[name="period"]').value = period;
        }
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
                series: {
                    pointStart: 1
                }
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
