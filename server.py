import os

from bottle import request, route, run

from pybomojo import get_box_office, get_movie_id

DEBUG = int(os.getenv('DEBUG', 0)) == 1
HOST = os.getenv('HOST', 'localhost')
PORT = int(os.getenv('PORT', 8080))


@route('/')
def index():
    search_term = request.query.q

    movie_id = get_movie_id(search_term)
    if movie_id is None:
        return None

    return get_box_office(movie_id)

run(host=HOST, port=PORT, debug=DEBUG)
