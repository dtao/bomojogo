import os
import random

from bottle import route, run, static_file, view

# configurable
DEBUG = int(os.getenv('DEBUG', 0)) == 1
HOST = os.getenv('HOST', 'localhost')
PORT = int(os.getenv('PORT', 8080))
API_HOST = os.getenv('API_HOST', HOST)

# Google analytics
GA_TRACKING_ID = os.getenv('GA_TRACKING_ID', None)

# Social sharing
SHARETHIS_PROPERTY_ID = os.getenv('SHARETHIS_PROPERTY_ID', None)

# Version of the app -- allow this to be configured via environment variable,
# i.e. if a particular provider grants this information via a specific variable
# name, set the APP_VERSION_PROPERTY variable to that name.
APP_VERSION = os.getenv(os.getenv('APP_VERSION_PROPERTY', 'APP_VERSION'),
                        # In debug contexts use a random 6-digit integer by
                        # default to effectively prevent browsers from caching
                        # assets.
                        str(random.randint(100000, 999999)) if DEBUG else '1')

# not configurable
APP_ROOT = os.path.dirname(__file__)


@route('/')
@view('index')
def index():
    return {
        'VIEW_NAME': 'index',
        'APP_VERSION': APP_VERSION,
        'API_HOST': API_HOST,
        'GA_TRACKING_ID': GA_TRACKING_ID,
        'SHARETHIS_PROPERTY_ID': SHARETHIS_PROPERTY_ID,
        'EXTRA_ASSETS': [
            # have had some trouble importing typeahead via npm
            'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-tagsinput/0.8.0/bootstrap-tagsinput.css',
            'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-tagsinput/0.8.0/bootstrap-tagsinput.js'
        ]
    }


@route('/static/<filename:path>')
def static(filename):
    return static_file(filename, root=os.path.join(APP_ROOT, 'static'))


@route('/matchup/<slug>')
@view('matchup')
def matchup(slug):
    return {
        'VIEW_NAME': 'matchup',
        'APP_VERSION': APP_VERSION,
        'API_HOST': API_HOST,
        'GA_TRACKING_ID': GA_TRACKING_ID,
        'SHARETHIS_PROPERTY_ID': SHARETHIS_PROPERTY_ID
    }

run(host=HOST, port=PORT, debug=DEBUG)
