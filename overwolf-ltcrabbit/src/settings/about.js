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

    this.common = common
    
    this.templates = require('../../dist/tmp/settings/templates.js')
    
    this.referredLink = "https://www.ltcrabbit.com/#afc17o"

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
        self.template = self.templates.about
	})
}

AboutPage.prototype.activate = function() {
    var self = this
	return console.tr('AboutPage.activate()', function()
	{
        window.document.title = "About"
        
        self.$content.html(self.template({
            self: self
        }))
	})
}

/* Module exports
============================================================================= */

module.exports = new AboutPage()
