import makeRequest from './make-request.js';

function createMatchup(properties, callback) {
    makeRequest('POST', '/matchups/', properties, callback);
}

export default createMatchup;
