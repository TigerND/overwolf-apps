/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-ltcrabbit:common')

/* Module exports
============================================================================= */

exports.dragResize = dragResize
exports.dragMove = dragMove
exports.closeWindow = closeWindow

/* Implementation
============================================================================= */

function dragResize(edge) {
    overwolf.windows.getCurrentWindow(function(result) {
        if (result.status == "success") {
        	console.log('DragResize:', result.window.id, edge)
            overwolf.windows.dragResize(result.window.id, edge);
        }
    })
}

function dragMove() {
    overwolf.windows.getCurrentWindow(function(result) {
        if (result.status == "success") {
            overwolf.windows.dragMove(result.window.id);
        }
    })
}

function closeWindow() {
    overwolf.windows.getCurrentWindow(function(result) {
        if (result.status == "success") {
            overwolf.windows.close(result.window.id);
        }
    })
}
