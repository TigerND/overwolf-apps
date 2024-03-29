/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-soundcloud:common')

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
