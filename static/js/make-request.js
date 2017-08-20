import config from './config.js';

function makeRequest(method, path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, config.getApiHost() + path);
    xhr.addEventListener('load', function() {
        var data;
        try {
            data = JSON.parse(xhr.responseText);
        } catch (e) {
            data = {
                'error': String(e)
            };
        }
        callback(data);
    });
    xhr.send();
}

export default makeRequest;
