document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('search-button').addEventListener('click', function(e) {
        e.preventDefault();

        document.getElementById('daily-results').innerHTML = '';
        document.getElementById('cumulative-results').innerHTML = '';

        var movieTitles = document.querySelector('textarea[name="title"]').value;

        // remove empty/blank lines
        movieTitles = movieTitles.split('\n').filter(function(title) {
            return !!title.replace(/\s+/g, '');
        });

        var period = document.querySelector('select[name="period"]').value,
            maxResults = getMaxResults(period);

        var results = [];
        movieTitles.forEach(function(title) {
            searchMovie(title, function(result) {
                results.push(result);
                if (results.length == movieTitles.length) {
                    chartMovies(results, maxResults);
                }
            });
        });
    });

    function searchMovie(title, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/search?title=' + encodeURIComponent(title));
        xhr.addEventListener('load', function() {
            callback(JSON.parse(xhr.responseText));
        });
        xhr.send();
    }

    function chartMovies(results, maxResults) {
        Highcharts.chart('daily-results', {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Daily Box Office'
            },
            xAxis: {
                title: {
                    'text': 'Days in release'
                },
                type: 'linear'
            },
            yAxis: {
                title: {
                    text: 'Daily box office'
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
                        return [daily.day, daily.gross];
                    })
                };
            }),
            credits: {
                enabled: false
            }
        });

        Highcharts.chart('cumulative-results', {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Cumulative Box Office'
            },
            xAxis: {
                title: {
                    'text': 'Days in release'
                },
                type: 'linear'
            },
            yAxis: {
                title: {
                    text: 'Cumulative box office'
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
                        return [daily.day, daily.cumulative];
                    })
                };
            }),
            credits: {
                enabled: false
            }
        });
    }

    function getMaxResults(period) {
        if (!period) {
            return null;
        }

        var parsed = period.match(/^(\d+)([dw])$/),
            value = Number(parsed[1]),
            unit = parsed[2];

        switch (unit) {
            case 'w':
                return value * 7;
            case 'd':
            default:
                return value;
        }
    }
});
