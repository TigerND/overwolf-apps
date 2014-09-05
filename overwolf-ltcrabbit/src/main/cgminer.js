/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-ltcrabbit:cgminer')

var $ = require('jquery')

/* Implementation
============================================================================= */

var CGMiner = function(opts) {
	opts = opts || {}
	this.proxy = opts.proxy || 'http:/localhost:4030/'
}

/* Implementation
============================================================================= */

CGMiner.prototype.command = function(proxy, miner, command, cb, eb)
{
	var data = { 
    	"api": { 
    		"address": miner.config.Address, 
    		"command": command 
    		}
    	}
	console.log('POST (' + proxy + '):', data)
	$.ajax({
		type: "POST",
		url: proxy,
	    data: data,
	    dataType: "json",
	}).done(function(data){
		console.log('Received:', data)
		try {
			if (data.STATUS[0].STATUS == 'S') {
				cb(data)
			} else {
				var textStatus = data.STATUS[0].Msg
				console.log('Error:', textStatus)
				eb(textStatus)
			}
		} catch(err) {
			console.log('Invalid data')
			eb('Invalid data')
		}
	}).fail(function(jqXHR, textStatus){
		console.log('Error:', textStatus)
	    eb(textStatus)
	})				
}

/* Module exports
============================================================================= */

module.exports = new CGMiner()
