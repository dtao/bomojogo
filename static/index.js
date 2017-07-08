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

        document.body.classList.add('loading');

        var results = [];
        movieTitles.forEach(function(title) {
            searchMovie(title, function(result) {
                results.push(result);
                if (results.length == movieTitles.length) {
                    chartMovies(results, maxResults);
                    document.body.classList.remove('loading');
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
        Highcharts.chart('daily-results', getChartOptions(
            'Daily box office', results, 'gross', maxResults));

        Highcharts.chart('cumulative-results', getChartOptions(
            'Cumulative box office', results, 'cumulative', maxResults));
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
