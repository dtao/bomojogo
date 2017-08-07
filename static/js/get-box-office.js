import config from './config.js';

function getBoxOffice(movie, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', config.getApiHost() + '/movies/' + encodeURIComponent(movie.movie_id) + '/boxoffice');
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

export default getBoxOffice;
