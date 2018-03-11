import config from './config.js';

function makeRequest(method, path, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, config.getApiHost() + path);

    if (method.toLowerCase() === 'post') {
        xhr.setRequestHeader('content-type', 'application/json');
        data = JSON.stringify(data);
    }

    // The 'data' argument is optional. If it's excluded, the third positional
    // argument is actually the callback.
    if (arguments.length == 3) {
        callback = data;
    }

    xhr.addEventListener('load', function() {
        var responseData;
        try {
            responseData = JSON.parse(xhr.responseText);
            if (responseData.errors) {
                responseData.errors = flattenErrors(responseData.errors);
            }
        } catch (e) {
            responseData = {
                errors: [String(e)]
            };
        }
        callback(responseData);
    });

    xhr.addEventListener('error', function(e) {
        callback({
            errors: ['Error from ' + method + ' request to ' + path]
        });
    });

    xhr.send(data);
}

function flattenErrors(errors) {
    var flattened = [];

    Object.keys(errors).forEach(function(key) {
        flattened.push.apply(flattened, errors[key].map(function(error) {
            return key + ': ' + error;
        }));
    });

    return flattened;
}

export default makeRequest;
