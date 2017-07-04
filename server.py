import os

from bottle import request, route, run, static_file, view

from pybomojo import get_box_office, get_movie_id

# configurable
DEBUG = int(os.getenv('DEBUG', 0)) == 1
HOST = os.getenv('HOST', 'localhost')
PORT = int(os.getenv('PORT', 8080))

# not configurable
APP_ROOT = os.path.dirname(__file__)


@route('/')
@view('index')
def index():
    return {}


@route('/search')
def search():
    search_term = request.query.title

    movie_id = get_movie_id(search_term)
    if movie_id is None:
        return None

    return get_box_office(movie_id)


@route('/static/<filename:path>')
def static(filename):
    return static_file(filename, root=os.path.join(APP_ROOT, 'static'))

run(host=HOST, port=PORT, debug=DEBUG)
