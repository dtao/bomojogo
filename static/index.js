/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = {
  getApiHost: function() {
    return document.body.getAttribute('data-api-host');
  }
};


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__config_js__);


function makeRequest(method, path, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, __WEBPACK_IMPORTED_MODULE_0__config_js___default.a.getApiHost() + path);

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
        } catch (e) {
            responseData = {
                error: String(e)
            };
        }
        callback(responseData);
    });

    xhr.addEventListener('error', function(e) {
        callback({
            error: 'Error from ' + method + ' request to ' + path
        });
    });

    xhr.send(data);
}

/* harmony default export */ __webpack_exports__["a"] = (makeRequest);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__config_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__make_request_js__ = __webpack_require__(1);



function getBoxOffice(movie, callback) {
    var path = '/movies/' + encodeURIComponent(movie.movie_id) + '/boxoffice';
    Object(__WEBPACK_IMPORTED_MODULE_1__make_request_js__["a" /* default */])('GET', path, function(data) {
        if (data.error) {
            data.error = 'No luck finding "' + movie.title + '" :(';
        }
        callback(data);
    });
}

/* harmony default export */ __webpack_exports__["a"] = (getBoxOffice);


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function getMaxResults(period, offset) {
    if (!period) {
        return null;
    }

    try {
        var parsed = period.match(/^(\d+)([dw])$/),
            value = Number(parsed[1]),
            unit = parsed[2];
    } catch (e) {
        return null;
    }

    switch (unit) {
        case 'w':
            value *= 7;
        case 'd':
        default:
            break;
    }

    return value + (offset || 0);
}

/* harmony default export */ __webpack_exports__["a"] = (getMaxResults);


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__get_box_office_js__ = __webpack_require__(2);


const DAYS = [ 'Fri', 'Thu', 'Wed', 'Tue', 'Mon', 'Sun', 'Sat'];

function loadAllMovies(movies, callback) {
    var results = [],
        dayOffset = 0;

    movies.forEach(function(movie) {
        Object(__WEBPACK_IMPORTED_MODULE_0__get_box_office_js__["a" /* default */])(movie, function(result) {
            // If loading page load, blah blah
            movie.title = result.title;

            results.push(result);
            if (results.length == movies.length) {
                dayOffset = alignResults(results);
                callback(results, dayOffset);
            }
        });
    });
}

function alignResults(results) {
    var dayOffset = getDayOffset(results);

    results.forEach(function(result) {
        padBoxOffice(result, dayOffset);
    });

    return dayOffset;
}

function getDayOffset(results) {
    var maxDayOffset = 0;

    results.forEach(function(result) {
        if (result.box_office.length == 0) {
            return;
        }
        maxDayOffset = Math.max(maxDayOffset, DAYS.indexOf(result.box_office[0].day));
    });

    return maxDayOffset;
}

function padBoxOffice(result, dayOffset) {
    if (result.box_office.length == 0) {
        return;
    }

    var currentDay = DAYS.indexOf(result.box_office[0].day);

    while (currentDay++ < dayOffset) {
        result.box_office.unshift({
            day: DAYS[currentDay],
            date: null,
            rank: null,
            gross: null,
            theaters: null,
            cumulative: null
        });
    }
}

/* harmony default export */ __webpack_exports__["a"] = (loadAllMovies);


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__chart_movies__ = __webpack_require__(6);


function renderCharts(results, maxResults) {
    Object(__WEBPACK_IMPORTED_MODULE_0__chart_movies__["a" /* default */])('daily-results', results, 'gross', 'Daily box office',
        maxResults);
    Object(__WEBPACK_IMPORTED_MODULE_0__chart_movies__["a" /* default */])('cumulative-results', results, 'cumulative',
        'Cumulative box office', maxResults);
}

/* harmony default export */ __webpack_exports__["a"] = (renderCharts);


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function chartMovies(containerId, results, property, title, maxResults) {
    Highcharts.chart(containerId,
      getChartOptions(title, results, property, maxResults));
}

function getChartOptions(title, results, property, maxResults) {
    return {
        chart: {
            zoomType: 'x'
        },
        title: {
            text: title
        },
        xAxis: {
            title: {
                'text': 'Weeks in release'
            },
            labels: {
                formatter: function() {
                    var week = Math.floor(this.value / 7) + 1;
                    return formatFriday(week);
                }
            },
            tickPositioner: function() {
                var positions = [];

                var largestResult = results.reduce(function(a, b) {
                    return a.box_office.length > b.box_office.length ? a : b;
                }, results[0]);

                largestResult.box_office.forEach(function(daily, i) {
                    if (daily.day == 'Fri') {
                        positions.push(i + 1);
                    }
                });

                // Don't display *too* many data labels (e.g. when using
                // "Forever" as the time period).
                if (positions.length > 10) {
                    positions = positions.filter(function(pos, i) {
                        return i % 2 == 0;
                    });
                }

                return positions;
            }
        },
        yAxis: {
            title: {
                text: title
            }
        },
        plotOptions: {
            line: {
                marker: {
                    enabled: false
                }
            },
            series: {
                pointStart: 1
            }
        },
        legend: {
            labelFormatter: function() {
                return this.name + ' <a href="' + results[this.index].href +
                    '" target="_blank"><small><span class="glyphicon ' +
                    'glyphicon-new-window"></span></small></a>';
            },
            useHTML: true
        },
        series: results.map(function(result) {
            var boxOffice = result.box_office;

            if (maxResults) {
                boxOffice = boxOffice.slice(0, maxResults);
            }

            return {
                type: 'line',
                name: result.title,
                data: boxOffice.map(function(daily) {
                    return [daily.day, daily[property]];
                })
            };
        }),
        credits: {
            enabled: false
        }
    };
}

function formatFriday(week) {
    var suffix;
    switch (week % 10) {
        case 1:
            suffix = 'st';
            break;
        case 2:
            if (week % 100 != 12) {
                suffix = 'nd';
            }
            break;
        case 3:
            if (week % 100 != 13) {
                suffix = 'rd';
            }
            break;
    }

    if (!suffix) {
        suffix = 'th';
    }

    return week + suffix + ' Friday';
}

/* harmony default export */ __webpack_exports__["a"] = (chartMovies);


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__config_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__create_matchup_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__get_box_office_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__get_matchups_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__get_max_results_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__load_all_movies_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__render_charts_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__css_index_css__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__css_index_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__css_index_css__);










document.addEventListener('DOMContentLoaded', function() {
    const TITLE_BASE = 'Box Office Hawk';

    var moviesField = document.querySelector('textarea[name="movies"]'),
        periodField = document.querySelector('select[name="period"]'),
        submitButton = document.getElementById('submit-button'),
        saveForm = document.getElementById('save-form'),
        closeErrorsButton = document.querySelector('#errors button.close'),
        errorsContainer = document.getElementById('errors'),
        errorsList = errorsContainer.querySelector('ul'),
        matchupsContainer = document.getElementById('matchups'),
        matchupsList = document.getElementById('matchups-list'),
        dailyResultsContainer = document.getElementById('daily-results'),
        cumulativeResultsContainer = document.getElementById('cumulative-results');

    // actual stuff that happens on page load
    loadMoviesFromQuery();
    initializeUI();
    initializeState();

    // all teh codez
    function loadMoviesFromQuery() {
        // No need to load everything back up if the page already has state.
        if (history.state) {
            return;
        }

        var query = parseQuery();

        if (query.movies) {
            loadMovies(query.movies.map(function(movieId) {
                return {
                    movie_id: movieId,
                    title: movieId
                };
            }), query.period, true);
        }
    }

    function initializeUI() {
        var moviesSearch = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: __WEBPACK_IMPORTED_MODULE_0__config_js___default.a.getApiHost() + '/movies/search?title=%TITLE',
                wildcard: '%TITLE',
                transform: function(response) {
                    return response.results;
                }
            }
        });

        $(moviesField).tagsinput({
            itemValue: 'movie_id',
            itemText: 'title',
            typeaheadjs: {
                displayKey: 'title',
                source: moviesSearch,
                limit: 10
            }
        });

        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            loadMovies($(moviesField).tagsinput('items'), periodField.value);
        });

        closeErrorsButton.addEventListener('click', hideErrors);

        saveForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var matchup = {
                title: saveForm.querySelector('[name="title"]').value,
                description: saveForm.querySelector('[name="description"]').value,
                movies: $(moviesField).tagsinput('items').map(
                    function(movie) {
                        return movie.movie_id;
                    }).join(','),
                period: periodField.value
            };

            document.body.classList.add('loading');
            Object(__WEBPACK_IMPORTED_MODULE_1__create_matchup_js__["a" /* default */])(matchup, function(result) {
                if (result.error) {
                    displayErrors([result.error]);
                    return;
                }

                window.location = '/matchup/' + result.slug;
            });
        });

        // Load one known good movie to ensure the API is awake.
        document.body.classList.add('loading');
        Object(__WEBPACK_IMPORTED_MODULE_2__get_box_office_js__["a" /* default */])({ title: 'Wonder Woman', movie_id: 'wonderwoman.htm' }, function(result) {
            if (result.error) {
                displayErrors(["Oh no! The API isn't responding :("]);
                return;
            }

            document.body.classList.remove('loading');
            document.querySelector('#search-form fieldset').removeAttribute('disabled');
        });

        Object(__WEBPACK_IMPORTED_MODULE_3__get_matchups_js__["a" /* default */])(function(matchups) {
            showMatchups(matchups);
        });
    }

    function initializeState() {
        if (history.state) {
            displayState(history.state, true);
        }

        window.addEventListener('popstate', function(e) {
            if (!e.state.movies) {
                return;
            }

            displayState(e.state, true);
        });
    }

    function displayState(state, refresh) {
        if (refresh) {
            populateForm(state.movies, state.period);
        }
        hideMatchups();
        Object(__WEBPACK_IMPORTED_MODULE_6__render_charts_js__["a" /* default */])(state.results, Object(__WEBPACK_IMPORTED_MODULE_4__get_max_results_js__["a" /* default */])(state.period, state.dayOffset || 0));
        updateTitle(state.movies);
    }

    function hideMatchups() {
        matchupsContainer.classList.add('hidden');
    }

    function showMatchups(matchups) {
        if (matchups.length > 0) {
            matchupsContainer.classList.remove('hidden');
        }

        matchups.forEach(function(matchup) {
            var item = document.createElement('a');
            item.classList.add('list-group-item');
            item.classList.add('list-group-item-action');
            item.setAttribute('href', '/matchup/' + matchup.slug);
            item.textContent = matchup.title;
            matchupsList.appendChild(item);
        });
    }

    function loadMovies(movies, period, refresh) {
        hideErrors();
        dailyResultsContainer.innerHTML = '';
        cumulativeResultsContainer.innerHTML = '';

        document.body.classList.add('loading');

        Object(__WEBPACK_IMPORTED_MODULE_5__load_all_movies_js__["a" /* default */])(movies, function(results, dayOffset) {
            extractErrors(results);
            displayState({
                movies: movies,
                period: period,
                dayOffset: dayOffset,
                results: results
            }, refresh);
            history.pushState({
                'movies': movies,
                'period': period,
                'results': results
            }, '', createQuery(movies, period));
            saveForm.classList.remove('hidden');

            document.body.classList.remove('loading');
        });
    }

    function extractErrors(results) {
        var errors = [];

        for (var i = results.length - 1; i >= 0; --i) {
            if (results[i].error) {
                errors.push(results[i].error);
                results.splice(i, 1);
            }
        }

        displayErrors(errors);
    }

    function hideErrors() {
        errorsContainer.classList.add('hidden');
    }

    function displayErrors(errors) {
        if (errors.length > 0) {
            errorsContainer.classList.remove('hidden');
        }

        errors.forEach(function(error) {
            var errorListItem = document.createElement('li');
            errorListItem.textContent = error;
            errorsList.appendChild(errorListItem);
        });
    }

    function populateForm(movies, period) {
        $(moviesField).tagsinput('removeAll');
        movies.forEach(function(movie) {
            $(moviesField).tagsinput('add', movie);
        });
        periodField.value = period || '';
    }

    function updateTitle(movies) {
        var title = TITLE_BASE;

        var movieTitles = movies.map(function(movie) {
            return movie.title;
        });

        if (movieTitles.length > 0) {
            title += ' - ' + movieTitles.join(' / ');
        }

        document.title = title;
    }

    function parseQuery() {
        var query = {};

        location.search.slice(1).split('&').forEach(function(param) {
            var pair = param.split('=');
            switch (pair[0]) {
                case 'movies':
                    query.movies = pair[1].split(',').map(decodeURIComponent);
                    break;
                case 'period':
                    query.period = pair[1];
                    break;
            }
        });

        return query;
    }

    function createQuery(movies, period) {
        var movieIds = movies.map(function(movie) {
            return movie.movie_id;
        });

        var query = '?movies=' + movieIds.map(encodeURIComponent).join(',');

        if (period) {
            query += '&period=' + period;
        }

        return query;
    }

    function getDayAtOrdinal(results, ordinal) {
        for (var i = 0; i < results.length; ++i) {
            if (ordinal > 0 && ordinal <= results[i].box_office.length) {
                return results[i].box_office[ordinal - 1].day;
            }
        }

        return null;
    }
});


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__make_request_js__ = __webpack_require__(1);


function createMatchup(properties, callback) {
    Object(__WEBPACK_IMPORTED_MODULE_0__make_request_js__["a" /* default */])('POST', '/matchups/', properties, callback);
}

/* harmony default export */ __webpack_exports__["a"] = (createMatchup);


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__make_request_js__ = __webpack_require__(1);


function getMatchups(callback) {
    Object(__WEBPACK_IMPORTED_MODULE_0__make_request_js__["a" /* default */])('GET', '/matchups/', callback);
}

/* harmony default export */ __webpack_exports__["a"] = (getMatchups);


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(11);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(13)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./index.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./index.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(12)(undefined);
// imports


// module
exports.push([module.i, "body.loading:after {\n  display: block;\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  background: no-repeat center url(\"/static/img/loading.gif\") #fff;\n  opacity: 0.75;\n}\n\n#errors {\n  position: absolute;\n  top: 20px;\n  left: 50%;\n  width: 600px;\n  margin-left: -300px;\n  z-index: 1;\n}\n\n#errors ul {\n  list-style: none;\n  padding-left: 0;\n}\n\n/* typeahead styling\n * mostly stolen from https://gist.github.com/mixisLv/f7872a90a8a31157e80364f08c955102\n */\n.twitter-typeahead {\n  width: 100%;\n}\n.twitter-typeahead .tt-query,\n.twitter-typeahead .tt-hint {\n  margin-bottom: 0;\n}\n.tt-hint {\n  display: block;\n  width: 100%;\n  height: 38px;\n  padding: 8px 12px;\n  font-size: 14px;\n  line-height: 1.428571429;\n  color: #999;\n  vertical-align: middle;\n  background-color: #ffffff;\n  border: 1px solid #cccccc;\n  border-radius: 4px;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;\n        transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;\n}\n.tt-menu {\n  min-width: 160px;\n  margin-top: 2px;\n  padding: 5px 0;\n  background-color: #ffffff;\n  border: 1px solid #cccccc;\n  border: 1px solid rgba(0, 0, 0, 0.15);\n  border-radius: 4px;\n  -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);\n        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);\n  background-clip: padding-box;\n\n}\n.tt-suggestion {\n  display: block;\n  padding: 3px 20px;\n}\n.tt-suggestion.tt-cursor,\n.tt-suggestion:hover {\n  color: #fff;\n  background-color: #428bca;\n  cursor: pointer;\n}\n.tt-suggestion p {\n  margin: 0;\n}\n\n/* tags input styling */\n.bootstrap-tagsinput {\n  width: 100%;\n}\n.bootstrap-tagsinput .tag {\n  line-height: 22px;\n}\n\n/* chart legend styling */\n.highcharts-legend-item a {\n  color: inherit;\n}\n", ""]);

// exports


/***/ }),
/* 12 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(14);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 14 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ })
/******/ ]);