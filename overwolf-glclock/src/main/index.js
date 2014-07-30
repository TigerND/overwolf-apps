/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint asi: true*/

var debug = require('debug')('overwolf-glclock:main')

var overwolf = global.overwolf

var $ = require('jquery')

/* Submodules
============================================================================= */

var common = require('../common')

/* Module
============================================================================= */

function Application() {
    var self = this

    this.common = common
    this.templates = require('../../dist/tmp/main/templates.js')
    
    this.content = null
}

/* Implementation
============================================================================= */

Application.prototype.start = function() {
    var self = this

    console.log('Location:', window.location)
    console.log('Overwolf:', overwolf)

    self.content = $('#content')

    self.content.mousedown(function() {
        common.dragMove()
    })
}

/* Exports
============================================================================= */

var app = new Application()

module.exports = app
global.app = app

/* Autostart
============================================================================= */

$(document).ready(function() {
    app.start();
})