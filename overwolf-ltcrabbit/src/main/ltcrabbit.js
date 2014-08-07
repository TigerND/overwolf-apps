/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-ltcrabbit:api')

var $ = require('jquery')

/* Implementation
============================================================================= */

var LTCRabbit = function(opts) {
	opts = opts || {}
	this.address = opts.address || 'https://www.ltcrabbit.com/index.php'
	this.appname = opts.appname || 'ltcrabbitjs'
	this.appversion = opts.appversion || '0.0.2'
}

/* Implementation
============================================================================= */

LTCRabbit.prototype.url = function(action, apikey, appname, appversion)
{
	var self = this
	
	url = self.address + '?page=api&action=' + action 
	if (apikey) {		
		url += '&api_key=' + apikey
		url += '&appname=' + (appname || self.appname)
		url += '&appversion=' + (appversion || self.appversion)
	}
	return url
}

LTCRabbit.prototype.query = function(action, apikey, cb, eb)
{
	var self = this

	eb = eb || function() {}
	
	var url = self.url(action, apikey)
	if (url) {
		console.log('GET:', url)
		$.ajax({
		    url: url,
		    dataType: "json"
		}).done(function(data) {
			cb(data)
		}).fail(function() {
		    eb()
		})
	} else {
		eb()
	}
}

LTCRabbit.prototype.getappdata = function(apikey, cb, eb)
{
	var self = this
	
	self.query('getappdata', apikey, 
		function(data)	{	
			cb(data.getappdata)
		},
		eb
	)
}

/* Module exports
============================================================================= */

module.exports = new LTCRabbit()
