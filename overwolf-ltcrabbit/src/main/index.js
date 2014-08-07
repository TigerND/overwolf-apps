/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-ltcrabbit:main')

var overwolf = global.overwolf // Just for Cloud9

var $ = require('jquery')

/* Submodules
============================================================================= */

var common = require('../common')

/* StateInfoObject
============================================================================= */

function StateInfoObject(data)
{
	this.requestTime = null
	this.responseTime = null
	this.emptyData = data
	this.data = data
	this.isExpired = function(timeout)
	{		
		if (!this.requestTime)
			return true
		var now = new Date().getTime()
		if ((this.responseTime) && (now - timeout > this.responseTime))
			return true
		return false
	}
	this.clear = function()
	{
		this.data = this.emptyData
	}
	this.onRequest = function()
	{
		this.requestTime = new Date().getTime()
		this.responseTime = null
	}
	this.onResponse = function(data)
	{
		this.responseTime = new Date().getTime()
		this.data = data
	}
	this.onError = function()
	{
		this.responseTime = new Date().getTime()
	}
}

/* WorkerState
============================================================================= */

function WorkerState(config) {
	this.config = config
	this.appdata = new StateInfoObject({})
	this.errCount = 0
	this.firstErrorTime = null
}

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
    this.api.appname = common.manifest.meta.name
    this.api.appversion = common.manifest.meta.version

    this.templates = require('../../dist/tmp/main/templates.js')
    
    this.workers = {}
    this.miners = {}
    
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
    
        setInterval(function() {
            self.update.apply(self)
        }, 1000)
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
		
		self.api.address = self.config.active.Pool.Address
	
		self.errCount = 0
		self.workers = {}
		self.miners = {}
		
		self.onStateChanged()
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

/* Workers
============================================================================= */

Application.prototype.stateForWorker = function(worker)
{
    var self = this
	if (!self.workers.hasOwnProperty(worker.UserId)) {
	    var state = self.workers[worker.UserId] = new WorkerState(worker)
	    return state
	} else {
	    return self.workers[worker.UserId]
	}
}

/* Mouse events
============================================================================= */

Application.prototype.update = function()
{
    var self = this
    console.log("Update:", self)
	if ((self.config.active) && (self.config.active.Pool.Workers))
	{
		self.config.active.Pool.Workers.forEach(function(v) {
			var worker = v;
			if (!worker.Disabled) {
				var info = self.stateForWorker(worker)
				if (info.appdata.isExpired(self.config.active.Pool.UpdateInterval * 1000)) {
				    console.log('Expired:', info)
					info.appdata.onRequest()
					self.api.getappdata(worker.ApiKey, 
						function(data) {
							info.appdata.onResponse(data)
							self.onWorkerUpdatePassed(info)					
						}, function () {
							info.appdata.onError()
							self.onWorkerUpdateFailed(info, null)
						}
					)						
				}
			}
		})
	}
}

Application.prototype.onWorkerUpdatePassed = function(worker)
{
    var self = this
    console.log("Worker update passed:", worker)
	worker.errCount = 0
	worker.firstErrorTime = null
	self.onStateChanged()
}

Application.prototype.onWorkerUpdateFailed = function(worker, reason)
{
    var self = this
    console.log("Worker update failed:", worker, reason)
	if (worker.errCount === 0) {
		worker.firstErrorTime = new Date().getTime()
	}		
	worker.errCount += 1
	self.onStateChanged()
}

/* State
============================================================================= */

Application.prototype.onStateChanged = function()
{
	/*jshint -W083 */
	for (var k in self.workers) {
		if (self.workers.hasOwnProperty(k)) {
			var info = self.workers[k]
			if ((info.appdata.data.user) && (info.appdata.data.user.username !== undefined))
			{
				if (info.appdata.data.worker) {						
					info.appdata.data.worker.forEach(function(v, i, a) {
						var userName = v.name
						if (userName.indexOf(info.appdata.data.user.username + '.') === 0) {
							a[i].name = userName.substring(info.appdata.data.user.username.length + 1)
						} else {
							a[i].name = userName.substring(userName.indexOf('.') + 1)
						}
					})
				}
			}			
		}
	}
	/*jshint +W083 */

    var self = this
	return console.tr('Application.onStateChanged()', function()
	{
		var balance = 0.0,
		    hashrate_scrypt = 0.0,
		    hashrate_x11 = 0.0,
		    invalid_shares_scrypt = 0.0,
		    invalid_shares_x11 = 0.0
		var now = new Date().getTime()
		for (var k in self.workers) {
			if (self.workers.hasOwnProperty(k)) {
				var info =self.workers[k]
			    if (info.appdata.data.user) {
					balance += info.appdata.data.user.balance
				    hashrate_scrypt += info.appdata.data.user.hashrate_scrypt
				    hashrate_x11 += info.appdata.data.user.hashrate_x11
				    invalid_shares_scrypt += info.appdata.data.user.invalid_shares_scrypt
				    invalid_shares_x11 += info.appdata.data.user.invalid_shares_x11
			    }
			}
		}
		self.fillValue('Balance', balance, 8)
		self.fillValue('HashrateScrypt', hashrate_scrypt, null)
		self.fillValue('HashrateX11', hashrate_x11, null)
		self.fillValue('InvalidScrypt', invalid_shares_scrypt, 2)
		self.fillValue('InvalidX11', invalid_shares_x11, 2)
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