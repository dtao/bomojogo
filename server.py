import os

from bottle import route, run, static_file, view

# configurable
DEBUG = int(os.getenv('DEBUG', 0)) == 1
HOST = os.getenv('HOST', 'localhost')
PORT = int(os.getenv('PORT', 8080))
API_HOST = os.getenv('API_HOST', HOST)

# Google analytics
GA_TRACKING_ID = os.getenv('GA_TRACKING_ID', None)

# not configurable
APP_ROOT = os.path.dirname(__file__)


@route('/')
@view('index')
def index():
    return {
        'API_HOST': API_HOST,
        'GA_TRACKING_ID': GA_TRACKING_ID
    }


@route('/static/<filename:path>')
def static(filename):
    return static_file(filename, root=os.path.join(APP_ROOT, 'static'))

run(host=HOST, port=PORT, debug=DEBUG)
