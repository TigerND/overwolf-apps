/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-ltcrabbit:main')

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
    
    this.api = require('./ltcrabbit.js')
    this.api.appname = 'overwolf-ltcrabbit'
    this.api.appversion = '2.0.0'
}

/* Implementation
============================================================================= */

Application.prototype.start = function() {
    var self = this

    console.log('Location:', window.location)

    var $content = $('#content')

    $content.html(self.templates.monitor())

    $content.mousedown(function() {
        common.dragMove()
    })
    
    console.log(app.api.query('public', undefined, function(data) {
    	console.log(data)

    	var apikey = '48ac636eda94a17aeb230e399feda85eac0bb92f411180f9b711eea7dfa87aad'
            self.api.getappdata(apikey, function(data) {
            	console.log(data)
            	$('#Balance').html(data.user.balance.toFixed(2))
            })
    }))    
}

Application.prototype.openHomepage = function() {
    window.open('https://www.ltcrabbit.com/#afc17o')
}

/* Exports
============================================================================= */

var app = new Application()

module.exports = app
global.app = app

/* Autostart
============================================================================= */

$(document).ready(function() {
    app.start()
})