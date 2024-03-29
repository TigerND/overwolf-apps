/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-ltcrabbit:main')

var util = require('util')

var overwolf = global.overwolf // Just for Cloud9

var $ = require('jquery'),
	Handlebars = require('handlebars')

/* Submodules
============================================================================= */

var common = require('../common')

var hashrate = require('./hashrate.js')

/* StateInfoObject
============================================================================= */

function StateInfoObject(owner, data)
{
	data = data || {}
	this.owner = owner
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
	this.update = function(timeout, query, cb)
	{
		var self = this
		cb = cb || function() {}
		if (self.isExpired(timeout)) {
			self.onRequest()
			query(function(data) {
				self.onResponse(data)
				self.owner.onSuccess()
				cb()
			}, function(reason) {
				self.onError()
				self.owner.onError()
				cb()
			})
		}
	}
}

/* ObjectState
============================================================================= */

function ObjectState(config) {
	this.config = config
	this.errCount = 0
	this.firstErrorTime = null
}

ObjectState.prototype.onSuccess = function() {
	this.errCount = 0
	this.firstErrorTime = null
}

ObjectState.prototype.onError = function() {
	if (this.errCount === 0) {
		this.firstErrorTime = new Date().getTime()
	}		
	this.errCount += 1
}

/* WorkerState
============================================================================= */

function WorkerState(config) {
	ObjectState.call(this, config)
	this.appdata = new StateInfoObject(this)
}
util.inherits(WorkerState, ObjectState)

/* MinerState
============================================================================= */

function MinerState(config) {
	ObjectState.call(this, config)
	this.summary = new StateInfoObject(this)
	this.pools = new StateInfoObject(this)
	this.devs = new StateInfoObject(this)
}
util.inherits(MinerState, ObjectState)

/* Module
============================================================================= */

function Application() {
    var self = this

    this.common = common
    this.hashrate = hashrate

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

    this.cgminer = require('./cgminer.js')

    this.templates = require('../../dist/tmp/main/templates.js')
    
    this.workers = {}
    this.miners = {}
    
    this.autoresize = true
    
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
        console.log('Overwolf:', overwolf)
    
		self.$content = $('#content')
        self.$content.html(self.templates.monitor())
        
        self.$content.mousedown(function() {
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

Application.prototype.fillValue = function(name, value, fractionDigits, suffix)
{
	if (value) {
		if (fractionDigits)
			value = value.toFixed(fractionDigits)
		document.getElementById(name).innerHTML = value.toString() + (suffix || '')
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

Application.prototype.stateForWorker = function(config)
{
    var self = this
	if (!self.workers.hasOwnProperty(config.UserId)) {
	    var state = self.workers[config.UserId] = new WorkerState(config)
	    return state
	} else {
	    return self.workers[config.UserId]
	}
}

/* Miners
============================================================================= */

Application.prototype.stateForMiner = function(config)
{
    var self = this
	if (!self.miners.hasOwnProperty(config.Address)) {
	    var state = self.miners[config.Address] = new MinerState(config)
	    return state
	} else {
	    return self.miners[config.Address]
	}
}

/* Update
============================================================================= */

Application.prototype.updateMiners = function()
{
	var self = this
	var proxy = self.config.active.Farm.Proxy
	if (proxy) {
		self.config.active.Farm.Miners.forEach(function(v) {
			var miner = v
			if (!miner.Disabled) {
				var info = self.stateForMiner(miner)
				var minerProxy = miner.Proxy || proxy
				var updateInterval = self.config.active.Farm.UpdateInterval * 1000
				// Summary
				info.summary.update(updateInterval, function(cb, eb) {
					self.cgminer.command(minerProxy, info, {command: 'summary'}, function(data) {
						cb(data.SUMMARY[0])
					}, eb)
				}, function() {
					self.onStateChanged()
				})
				// Devices
				info.devs.update(updateInterval, function(cb, eb) {
					self.cgminer.command(minerProxy, info, {command: 'devs'}, function(data) {
						cb(data.DEVS)
					}, eb)
				}, function() {
					self.onStateChanged()
				})
			}
		})
	}
}

Application.prototype.update = function()
{
    var self = this
    //console.log("Update:", self)
	if (self.config.active)
	{
		// Workers
		if (self.config.active.Pool.Workers) {
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
		// Miners
		self.updateMiners()
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

Application.prototype.fillWorkersInfo = function()
{
    var self = this

	var panels = ''
	for (var k in self.workers) {
		if (self.workers.hasOwnProperty(k)) {
			var worker = self.workers[k]
			var name = (worker.appdata.data.user && worker.appdata.data.user.username) ? worker.appdata.data.user.username : 'Workers'
			panels += self.templates.workers({
				name: name + '-panel',
				caption: name,
				workers: worker.appdata.data.worker
			})
		}
	}
    var $workersPanel = $('#workers-panel')
    $workersPanel.html(panels)
}

Application.prototype.onStateChanged = function()
{
    var self = this
	return console.tr('Application.onStateChanged()', function()
	{
	    // Names
    	for (var k in self.workers) {
    		if (self.workers.hasOwnProperty(k)) {
    			var info = self.workers[k]
    			if ((info.appdata.data.user) && (info.appdata.data.user.username !== undefined))
    			{
    				if (info.appdata.data.worker) {						
                    	/*jshint -W083 */
    					info.appdata.data.worker.forEach(function(v, i, a) {
    						var userName = v.name
    						if (userName.indexOf(info.appdata.data.user.username + '.') === 0) {
    							a[i].name = userName.substring(info.appdata.data.user.username.length + 1)
    						} else {
    							a[i].name = userName.substring(userName.indexOf('.') + 1)
    						}
    					})
                    	/*jshint +W083 */
    				}
    			}			
    		}
    	}

        // Summary
		var balance = 0.0,
		    hashrate_scrypt = 0.0,
		    hashrate_x11 = 0.0,
		    invalid_shares_scrypt = 0.0,
		    invalid_shares_x11 = 0.0
		for (k in self.workers) {
			if (self.workers.hasOwnProperty(k)) {
				var worker = self.workers[k]
			    if (worker.appdata.data.user) {
					balance += worker.appdata.data.user.balance
				    hashrate_scrypt += worker.appdata.data.user.hashrate_scrypt
				    hashrate_x11 += worker.appdata.data.user.hashrate_x11
				    invalid_shares_scrypt += worker.appdata.data.user.invalid_shares_scrypt
				    invalid_shares_x11 += worker.appdata.data.user.invalid_shares_x11
			    }
			}
		}
		self.fillValue('Balance', balance, 8)
		self.fillValue('HashrateScrypt', self.hashrate.format(hashrate_scrypt * 1024), null, '')
		self.fillValue('HashrateX11', self.hashrate.format(hashrate_x11 * 1024), null, '')
		self.fillValue('InvalidScrypt', hashrate_scrypt ? invalid_shares_scrypt : null, 2, '%')
		self.fillValue('InvalidX11', hashrate_x11 ? invalid_shares_x11 : null, 2, '%')
		
		//Workers
		self.fillWorkersInfo()
		
		if (self.autoresize) {
			console.log('Size:', self.$content.outerWidth(true), 'x', self.$content.outerHeight(true))
		    overwolf.windows.getCurrentWindow(function(result) {
			    if (result.status == "success") {
			    	console.log('Resizing window:', result.window.id)
			        overwolf.windows.changeSize(result.window.id,
			            self.$content.outerWidth(true),
			            self.$content.outerHeight(true) + 20,
			            function() {
			            	console.log('Window size changed')
			            }
			        )
			    }
			})
		}
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