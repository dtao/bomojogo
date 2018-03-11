import chartMovies from './chart-movies';

function renderCharts(results, maxResults) {
    chartMovies('daily-results', results, 'gross', 'Daily box office',
        maxResults);
    chartMovies('cumulative-results', results, 'cumulative',
        'Cumulative box office', maxResults);

    function dailyChange(daily, index, boxOffice) {
      if (index == 0) {
        return 100;
      }

      return Math.round(daily.gross / boxOffice[index - 1].gross * 100);
    }

    chartMovies('daily-change-results', results, dailyChange,
        'Daily % change', maxResults);

    function weeklyChange(daily, index, boxOffice) {
        if (index < 7) {
            return null;
        }

        return Math.round(daily.gross / boxOffice[index - 7].gross * 100);
    }

    chartMovies('weekly-change-results', results, weeklyChange,
        'Weekly % change', maxResults, { xAxis: { min: 8 } });
}

export default renderCharts;
