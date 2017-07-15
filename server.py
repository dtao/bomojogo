import os

from bottle import request, route, run, static_file, view

from pybomojo import get_box_office, get_movie_id, search_movies

# configurable
DEBUG = int(os.getenv('DEBUG', 0)) == 1
HOST = os.getenv('HOST', 'localhost')
PORT = int(os.getenv('PORT', 8080))

# Google analytics
GA_TRACKING_ID = os.getenv('GA_TRACKING_ID', None)

# not configurable
APP_ROOT = os.path.dirname(__file__)


@route('/')
@view('index')
def index():
    return {'GA_TRACKING_ID': GA_TRACKING_ID}


@route('/search')
def search():
    search_term = request.query.title
    results = search_movies(search_term)

    # Move exact result to the top. This is very inefficient, but it'll get the
    # job done for now. (The more efficient code would be slightly uglier.)
    results = ([result for result in results if result['exact']] +
               [result for result in results if not result['exact']])

    return {'results': results}


@route('/boxoffice')
def box_office():
    movie_id = request.query.movie_id
    return get_box_office(movie_id)


@route('/boxoffice/search')
def box_office_search():
    search_term = request.query.title
    movie_id = get_movie_id(search_term)
    return get_box_office(movie_id)


@route('/static/<filename:path>')
def static(filename):
    return static_file(filename, root=os.path.join(APP_ROOT, 'static'))

run(host=HOST, port=PORT, debug=DEBUG)
