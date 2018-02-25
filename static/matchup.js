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
/******/ 	return __webpack_require__(__webpack_require__.s = 15);
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
                'error': String(e)
            };
        }
        callback(responseData);
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
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__get_max_results_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__load_all_movies_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__make_request_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__render_charts_js__ = __webpack_require__(5);





document.addEventListener('DOMContentLoaded', function() {
    var titleElement = document.getElementById('title'),
        descriptionElement = document.getElementById('description');

    document.body.classList.add('loading');

    var slug = location.pathname.split('/').pop();
    Object(__WEBPACK_IMPORTED_MODULE_2__make_request_js__["a" /* default */])('GET', '/matchups/' + slug, function(data) {
        var movies = data.movies.map(function(movieId) {
            return {
                movie_id: movieId,
                title: movieId
            };
        });

        Object(__WEBPACK_IMPORTED_MODULE_1__load_all_movies_js__["a" /* default */])(movies, function(results, dayOffset) {
            displayMatchup(data, results, dayOffset);
            document.body.classList.remove('loading');
        });
    });

    function displayMatchup(matchupData, results, dayOffset) {
        titleElement.textContent = matchupData.title;
        descriptionElement.innerHTML = marked(matchupData.description);
        Object(__WEBPACK_IMPORTED_MODULE_3__render_charts_js__["a" /* default */])(results, Object(__WEBPACK_IMPORTED_MODULE_0__get_max_results_js__["a" /* default */])(matchupData.period, dayOffset));
    }
});


/***/ })
/******/ ]);