document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('search-button').addEventListener('click', function(e) {
        e.preventDefault();

        var resultsEl = document.getElementById('results');
        resultsEl.textContent = '';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/search?title=' + encodeURIComponent(document.querySelector('input[name="title"]').value));
        xhr.addEventListener('load', function() {
            var result = JSON.parse(xhr.responseText);
            resultsEl.textContent = JSON.stringify(result, null, 2);
        });
        xhr.send();
    });
});
