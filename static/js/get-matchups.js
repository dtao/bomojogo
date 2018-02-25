import makeRequest from './make-request.js';

function getMatchups(callback) {
    makeRequest('GET', '/matchups/', callback);
}

export default getMatchups;
