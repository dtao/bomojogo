import getBoxOffice from './get-box-office.js';

const DAYS = [ 'Fri', 'Thu', 'Wed', 'Tue', 'Mon', 'Sun', 'Sat'];

function loadAllMovies(movies, callback) {
    var results = [],
        dayOffset = 0;

    movies.forEach(function(movie) {
        getBoxOffice(movie, function(result) {
            // If loading page load, blah blah
            movie.title = result.title;

            results.push(result);
            if (results.length == movies.length) {
                dayOffset = alignResults(results);
                callback(results, dayOffset);
            }
        });
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

export default loadAllMovies;
