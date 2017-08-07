module.exports = {
  getApiHost: function() {
    return document.body.getAttribute('data-api-host');
  }
};
