/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-utils:common')

var overwolf = global.overwolf // Just for Cloud9

var $ = require('jquery')

global.$ = $ // For external scripts

/* Module
============================================================================= */

function Module() {
    this.manifest = require('../../dist/package/manifest.json') || {}
}

/* Language
============================================================================= */

Module.prototype.detectLanguage = function(cb) {
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

Module.prototype.dragResize = function(edge) {
    overwolf.windows.getCurrentWindow(function(result) {
        console.log('dragResize:', result)
        if (result.status == "success") {
            overwolf.windows.dragResize(result.window.id, edge);
        }
    })
}

Module.prototype.dragMove = function() {
    overwolf.windows.getCurrentWindow(function(result) {
        console.log('dragMove:', result)
        if (result.status == "success") {
            overwolf.windows.dragMove(result.window.id);
        }
    })
}

Module.prototype.closeWindow = function() {
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

/* Module exports
============================================================================= */

module.exports = new Module()