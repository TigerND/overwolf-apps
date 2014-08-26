/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var $ = require('jquery'),
	Handlebars = require('handlebars')

/* Consts
============================================================================= */

var rateNames = 'kmgtpezy'

/* Submodules
============================================================================= */

function Hashrate() {
    var self = this

    this.rateKinds = []
    
    var l = 1
    for (var i = 0; i < rateNames.length; i++) {
        l *= 1024
        var n = rateNames.charAt(i)
        this.rateKinds.unshift({l:l,n:n,d:(i===0)?0:2})
    }

	Handlebars.registerHelper('hashrate', function(value) {
	    return self.hbHashrate(this, value)
	})
}

/* Implementation
============================================================================= */

Hashrate.prototype.format = function(value) {
    var self = this
    if (value===0) {
        return 'n/a'
    }
    for (var key in self.rateKinds) {
        var item = self.rateKinds[key]
        if (value >= item.l) {
            return (value / item.l).toFixed(item.d) + item.n
        }
    }
    return value.toString() + 'b'
}

/* Handlebars helpers
============================================================================= */

Hashrate.prototype.hbHashrate = function(sender, value) {
	var self = this
	var result = 'n/a'
	if (value) {
		result = self.format(value * 1024)
	}
	return new Handlebars.SafeString(result)
}

/* Submodules
============================================================================= */

module.exports = new Hashrate()