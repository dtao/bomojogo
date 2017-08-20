import config from './config.js';
import makeRequest from './make-request.js';

function getBoxOffice(movie, callback) {
    var path = '/movies/' + encodeURIComponent(movie.movie_id) + '/boxoffice';
    makeRequest('GET', path, function(data) {
        if (data.error) {
            data.error = 'No luck finding "' + movie.title + '" :(';
        }
        callback(data);
    });
}

export default getBoxOffice;
