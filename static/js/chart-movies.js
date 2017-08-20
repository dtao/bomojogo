function chartMovies(containerId, results, property, title, maxResults) {
    Highcharts.chart(containerId,
      getChartOptions(title, results, property, maxResults));
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
                return this.name + ' <a href="' + results[this.index].href +
                    '" target="_blank"><small><span class="glyphicon ' +
                    'glyphicon-new-window"></span></small></a>';
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

export default chartMovies;
