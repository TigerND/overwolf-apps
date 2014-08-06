/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-ltcrabbit:about-page')

var overwolf = global.overwolf // Just for Cloud9

var $ = require('jquery'),
    util = require('util'),
    Handlebars = require('handlebars')

/* Submodules
============================================================================= */

var common = require('../common')

/* Module
============================================================================= */

function AboutPage() {
    var self = this

    this.$content = null
    this.template = null
}

/* Implementation
============================================================================= */

AboutPage.prototype.init = function(content) {
    var self = this
	return console.tr('AboutPage.init()', function()
	{
        self.$content = content
        self.template = Handlebars.compile($("#about-template").html())
	})
}

AboutPage.prototype.activate = function() {
    var self = this
	return console.tr('AboutPage.activate()', function()
	{
        self.$content.html(self.template({
            version: '2.1.0'
        }))
	})
}

/* Module exports
============================================================================= */

module.exports = new AboutPage()
