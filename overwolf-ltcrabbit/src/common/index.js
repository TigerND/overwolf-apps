/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-soundcloud:common')

var overwolf = global.overwolf // Just for Cloud9

var $ = require('jquery')

/* Module exports
============================================================================= */

exports.detectLanguage = detectLanguage
exports.dragResize = dragResize
exports.dragMove = dragMove
exports.closeWindow = closeWindow

/* Implementation
============================================================================= */

function detectLanguage(cb) {
    var language = window.navigator.userLanguage || window.navigator.language;
    if (language) {
        cb(language)
    } else {
        $.ajax({
            url: "http://ajaxhttpheaders.appspot.com",
            dataType: 'jsonp',
            success: function(headers) {
                var language = headers['Accept-Language']
                console.log('Language:', language)
                cb(language)
            }
        })
    }
}

/* Mouse events
============================================================================= */

function dragResize(edge) {
    overwolf.windows.getCurrentWindow(function(result) {
        console.log('dragResize:', result)
        if (result.status == "success") {
            overwolf.windows.dragResize(result.window.id, edge);
        }
    })
}

function dragMove() {
    overwolf.windows.getCurrentWindow(function(result) {
        console.log('dragMove:', result)
        if (result.status == "success") {
            overwolf.windows.dragMove(result.window.id);
        }
    })
}

function closeWindow() {
    overwolf.windows.getCurrentWindow(function(result) {
        console.log('closeWindow:', result)
        if (result.status == "success") {
            overwolf.windows.close(result.window.id);
        }
    })
}

/* Tracer
============================================================================= */

var tracers = {}

tracers.debug = function(name, cb)
{
	console.log('--> ' + name)
	try {
		var result = cb(arguments)
		console.log('<-- ' + name, 'Result:', result)
		return result
	}
	catch(e) {
		console.trace('ERR ' + e)
		console.log('<-- ' + name)
		throw e
	}
}

tracers.release = function(name, cb)
{
	return cb()
}

console.tr = tracers.debug
