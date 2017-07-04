document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('search-button').addEventListener('click', function(e) {
        e.preventDefault();

        document.getElementById('results').innerHTML = '';

        searchMovie(document.querySelector('input[name="title"]').value);
    });

    function searchMovie(title) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/search?title=' + encodeURIComponent(movieTitle);
        xhr.addEventListener('load', function() {
            chartMovie(JSON.parse(xhr.responseText));
        });
        xhr.send();
    }

    function chartMovie(data) {
        Highcharts.chart('results', {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: data.title + ' Box Office'
            },
            xAxis: {
                type: 'datetime'
            },
            legend: {
                enabled: false
            },
            series: [{
                type: 'line',
                name: 'Daily Gross',
                data: data.box_office.map(function(daily) {
                    return [Date.parse(daily.date), daily.gross];
                })
            }],
            credits: {
                enabled: false
            }
        });
    }
});
