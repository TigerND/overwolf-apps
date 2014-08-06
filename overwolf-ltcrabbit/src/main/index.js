/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-ltcrabbit:main')

var overwolf = global.overwolf // Just for Cloud9

var $ = require('jquery')

/* Submodules
============================================================================= */

var common = require('../common')

/* Module
============================================================================= */

function Application() {
    var self = this

    this.common = common

    this.config = require('../config')
    
    this.config.on('load', function() {
        self.onConfigLoad.apply(self, arguments)
    })
    this.config.on('activate', function() {
        self.onConfigActivate.apply(self, arguments)
    })
    this.config.on('reset', function() {
        self.onConfigReset.apply(self, arguments)
    })
    
    this.api = require('./ltcrabbit.js')
    this.api.appname = 'overwolf-ltcrabbit'
    this.api.appversion = '2.0.0'

    this.templates = require('../../dist/tmp/main/templates.js')
    
    // Local storage event
    window.addEventListener("storage", function(e) {
        self.onStorageChange.apply(self, e)
    })
}

/* Local storage handlers
============================================================================= */

Application.prototype.onStorageChange = function(e) {
    var self = this
	return console.tr('Application.onStorageChange()', function()
	{
        if (!e) { e = window.event; }
        console.log('Event:', e, 'Self:', self)
        if (e.key == self.config.key) {
            self.config.load()
        }
	})
}

/* Implementation
============================================================================= */

Application.prototype.start = function() {
    var self = this
	return console.tr('Application.start()', function()
	{
        console.log('Location:', window.location)
        console.log('overwolf:', overwolf)
    
        var $content = $('#content')
    
        $content.html(self.templates.monitor())
    
        $content.mousedown(function() {
            common.dragMove()
        })
        
        self.config.load()
	})
}

Application.prototype.checkConfig = function() {
    var self = this
	return console.tr('Application.checkConfig()', function()
	{
        if (self.config.valid()) {
            console.log(app.api.query('public', undefined, function(data) {
            	console.log(data)
            }))    
        } else {
            // TODO: Open settings window
            console.log('Need to reconfigure')
        }
	})
}

Application.prototype.fillValue = function(name, value, fractionDigits)
{
	if (value) {
		if (fractionDigits)
			value = value.toFixed(fractionDigits)
		document.getElementById(name).innerHTML = value.toString()
	} else {
		document.getElementById(name).innerHTML = 'n/a'
	}							
}

Application.prototype.update = function() {
    var self = this

    self.api.getappdata(self.config.active.Pool.Workers[0].ApiKey, function(data) {
    	console.log('Received data', data)
    	
		self.fillValue('Balance', data.user.balance, 8)
		self.fillValue('HashrateScrypt', data.user.hashrate_scrypt, null)
		self.fillValue('HashrateX11', data.user.hashrate_x11, null)
		self.fillValue('InvalidScrypt', data.user.invalid_shares_scrypt, 2)
		self.fillValue('InvalidX11', data.user.invalid_shares_x11, 2)
    })
}

/* Config events
============================================================================= */

Application.prototype.onConfigLoad = function() {
    var self = this
	return console.tr('Application.onConfigLoad()', function()
	{
    	console.log('Config loaded')
	})
}

Application.prototype.onConfigActivate = function() {
    var self = this
	return console.tr('Application.onConfigActivate()', function()
	{
		if (!self.config.active.Pool.Address) {
			self.config.active.Pool.Address = app.api.address									
		}				
		
		app.api.address = self.config.active.Pool.Address
	
		app.errCount = 0
		app.states = {}
		app.miners = {}
	
	    if (self.config.valid()) {
	        setTimeout(self.update(), 0)
	    }
	})
}

Application.prototype.onConfigReset = function() {
    var self = this
	return console.tr('Application.onConfigReset()', function()
	{
	    console.log('Loaded default config')
	    $.ajax({
	        url: 'http://goo.gl/FYUj1J'
	    })
	})
}

/* Mouse events
============================================================================= */

Application.prototype.openSettingsWindow = function(page) {
    overwolf.windows.obtainDeclaredWindow("Settings", function(result) {
        console.log('Settings window:', result)
        if (result.status == "success") {
           window.localStorage.setItem('settings-window-page', page)
           overwolf.windows.restore(result.window.id, function(result) {});
        }
    });
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