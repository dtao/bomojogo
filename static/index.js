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

        var results = [];
        movieTitles.forEach(function(title) {
            searchMovie(title, function(result) {
                results.push(result);
                if (results.length == movieTitles.length) {
                    chartMovies(results);
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

    function chartMovies(results) {
        Highcharts.chart('daily-results', {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Daily Box Office'
            },
            xAxis: {
                type: 'linear'
            },
            series: results.map(function(result) {
                return {
                    type: 'line',
                    name: result.title,
                    data: result.box_office.map(function(daily) {
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
                type: 'linear'
            },
            series: results.map(function(result) {
                return {
                    type: 'line',
                    name: result.title,
                    data: result.box_office.map(function(daily) {
                        return [daily.day, daily.cumulative];
                    })
                };
            }),
            credits: {
                enabled: false
            }
        });
    }
});
