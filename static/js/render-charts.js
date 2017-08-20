import chartMovies from './chart-movies';

function renderCharts(results, maxResults) {
    chartMovies('daily-results', results, 'gross', 'Daily box office',
        maxResults);
    chartMovies('cumulative-results', results, 'cumulative',
        'Cumulative box office', maxResults);
}

export default renderCharts;
