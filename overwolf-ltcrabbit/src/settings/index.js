/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-ltcrabbit:settings')

var overwolf = global.overwolf // Just for Cloud9

var $ = require('jquery'),
    util = require('util'),
    Handlebars = require('handlebars')

global.$ = $ // For external scripts

/* Submodules
============================================================================= */

var common = require('../common')

/* Module
============================================================================= */

function Settings() {
    var self = this
    
    self.common = common
    
    this.pages = {
        about: require('./about.js'),
        config: require('./config.js')
    }

    // Local storage event
    window.addEventListener("storage", function(e) {
        self.onStorageChange.apply(self, e)
    })
}

/* Local storage handlers
============================================================================= */

Settings.prototype.onStorageChange = function(e) {
    var self = this
	return console.tr('Settings.onStorageChange()', function()
	{
        if (!e) { e = window.event; }
        console.log('Event:', e, 'Self:', self)
        if (e.key == 'settings-window-page') {
            if (self.pages.hasOwnProperty(e.newValue)) {
                self.activatePage(e.newValue)
            }
        }
	})
}

/* Pages
============================================================================= */

Settings.prototype.initPages = function() {
    var self = this
	return console.tr('Settings.initPages()', function()
	{
    	var $content = $('#content')
    	for (var name in self.pages) {
    	    console.log('Processing', name)
    		if (self.pages.hasOwnProperty(name)) {
            	var page = self.pages[name]
            	page.init($content)
    	    }
    	}
	})
}

Settings.prototype.activatePage = function(name) {
    var self = this
	return console.tr('Settings.activatePage()', function()
	{
	    name = name || window.localStorage.getItem('settings-window-page') || 'about'
	    console.log('Page name:', name) 
    	var page = self.pages[name]
    	page.activate()
	})
}

/* Implementation
============================================================================= */

Settings.prototype.start = function() {
    var self = this
	return console.tr('Settings.start()', function()
	{
	    self.initPages()
	    self.activatePage()
	})
}

/* Exports
============================================================================= */

var app = new Settings()

module.exports = app
global.app = app

/* Autostart
============================================================================= */

$(document).ready(function() {
    app.start();
})
