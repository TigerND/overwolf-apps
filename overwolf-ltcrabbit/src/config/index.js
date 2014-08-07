/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-ltcrabbit:config')

var $ = require('jquery'),
	util = require('util')

var EventEmitter = require('events').EventEmitter

/* Submodules
============================================================================= */

var common = require('../common');

/* Implementation
============================================================================= */

function Config() {
	
	this.key = 'v2.config.rev.2'
	
	this.schema = { 
		type: 'object',
		name: 'Config',
		description: 'LTCRabbit Monitor Config',
		properties: {
			Pool: {
				type: 'object',
				label: "LTCRabbit Public API",
				properties: {
					UpdateInterval: { 
						type: 'integer',
						label: "Interval",
						description: "Update interval (seconds)",
						required: true 
					},
					Address: { 
						type: 'string',
						label: "Address",
						required: true
					},
					Workers: {
						type: "array",
						label: "Accounts",
						description: "You can find your <i>API&nbsp;Key</i> on the <a href='javascript: window.open(\"https://www.ltcrabbit.com/#afc17o\")'><strong>Account&nbsp;Settings</strong></a> page",
						items: {
							type: "object",    	                
							properties: {
								Disabled: { 
									type: 'boolean',
									label: "Disabled"
								},
								ApiKey: { 
									type: 'string', 
									label: "API Key",
									required: true 
								}
							} 
						}
					}					
				}
			},
			Farm: {
				type: 'object',
				label: "CGMiner/BFGMiner API",
				properties: {
					UpdateInterval: { 
						type: 'integer',
						label: "Interval",
						description: "Update interval (seconds)",
						required: true 
					},
					Proxy: { 
						type: 'string',
						label: "Proxy",
						required: false,						
						description: "This monitor doesn't support direct TCP connections to CGMiner/BFGMiner API. However you can use <a href='javascript: window.open(\"https://github.com/TigerND/cgminer2http\")'><strong>cgminer2http</strong></a> proxy to monitor you miners",
					},
					Miners: {
						type: "array",
						label: "Miners",						
						items: {
							type: "object",    	                
							properties: {
								Disabled: { 
									type: 'boolean',
									label: "Disabled"
								},
								Name: { 
									type: "string", 
									required: false 
									},
								Address: { 
									type: "string", 
									required: true 
									},
								Proxy: { 
									type: "string", 
									required: false
									}
								}
							}
						}
					}
				}
			}
    	}
    	
	this.default =  {
		Pool: {
			UpdateInterval: 30,
			Address: 'https://www.ltcrabbit.com/index.php',
			Workers: [
			    {
			    	Disabled: false,
			    	ApiKey: ''
			    }
			]
		},
		Farm: {
			UpdateInterval: 3,
			Proxy: 'http:/localhost:4030/',
			Miners: [
			    {
			    	Disabled: true,
			    	Address: 'localhost:4028',
			    }
			]
		}
	}
	
	this.active = null
	this.inactive = this.default
}

util.inherits(Config, EventEmitter);

/* Implementation
============================================================================= */

Config.prototype.valid = function()
{
	var self = this
	return console.tr('Config.valid()', function()
	{
		var result = true
		if (!self.active) {
			console.log("There's no active config")
			return false
		}
		if (!self.active.Pool.Address) {
			console.log("There's no pool address")
			return false
		}
		self.active.Pool.UpdateInterval = Math.max(self.active.Pool.UpdateInterval, 30) || 30
		self.active.Farm.UpdateInterval = Math.max(self.active.Farm.UpdateInterval, 2) || 2
		self.active.Pool.Workers.forEach(function(v) {
			if (!v.ApiKey) {
				console.log("Invalid pool account parameters")
				result = false
				return false
			}
		})
		if (!result)
			return false
		self.active.Farm.Miners.forEach(function(v) {
			if (!v.Address) {
				console.log("Invalid miner parameters")
				result = false
				return false
			}
		})
		return result
	})
}

Config.prototype.load = function()
{
	var self = this
	return console.tr('Config.load()', function()
	{
		var conf = window.localStorage.getItem(self.key)
		if (conf) {
			console.log("Loaded", conf)
			try {
				var config = JSON.parse(conf)
				self.activate(config)
				self.emit('load', self)
			} catch(e) {
				self.emit('loaderror')
			}
		} else {
			self.emit('loaderror')
		}
	})
}

Config.prototype.save = function()
{
	var self = this
	return console.tr('Config.save()', function()
	{	  
		console.log('Key:', self.key, 'Config:', self.active)
		window.localStorage.setItem(self.key, JSON.stringify(self.active))
	})
}

Config.prototype.activate = function(conf, opts)
{
	var self = this
	return console.tr('Config.activate()', function()
	{	  
		opts = opts || {}
		conf = conf || self.inactive
		
		var allowInvalid = opts.allowInvalid || false
		
		self.inactive = self.active
		self.active = $.extend({}, conf)
		if (allowInvalid || self.valid())
		{			
			self.emit('activate')
			self.save()
		} else {			
			self.active = self.inactive
			self.emit('activateerror')
		}
	})
}

Config.prototype.reset = function()
{
	var self = this
	return console.tr('Config.reset()', function()
	{
		self.activate(self.default, {
			allowInvalid: true
		})
		self.emit('reset', self)
	})
}

/* Module exports
============================================================================= */

module.exports = new Config()
