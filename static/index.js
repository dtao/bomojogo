document.addEventListener('DOMContentLoaded', function() {
    // actual stuff that happens on page load
    loadMoviesFromQuery();
    initializeUI();
    initializeState();

    // all teh codez
    function loadMoviesFromQuery() {
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
        window.addEventListener('popstate', function(e) {
            if (!e.state.movies) {
                return;
            }

            populateForm(e.state.movies, e.state.period);
            chartMovies(e.state.results, getMaxResults(e.state.period));
        });
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
                    chartMovies(results, getMaxResults(period));
                    history.pushState({
                        'movies': movies,
                        'period': period,
                        'results': results
                    }, '', createQuery(movies, period));

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
                    'text': 'Days in release'
                },
                type: 'linear'
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
});
