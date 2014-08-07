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

function ConfigPage() {
    var self = this

    this.common = common
    
    this.templates = require('../../dist/tmp/settings/templates.js')
    
    this.config = require('../config')
    
    this.$content = null
    this.template = null
}

/* Implementation
============================================================================= */

ConfigPage.prototype.init = function(content) {
    var self = this
	return console.tr('ConfigPage.init()', function()
	{
        self.$content = content
        self.template = self.templates.config
	})
}

ConfigPage.prototype.activate = function() {
    var self = this
	return console.tr('ConfigPage.activate()', function()
	{
        window.document.title = "Settings"
        
        self.$content.html(self.template({
        	self: self
        }))

		self.config.load()
		
		var onde = global.onde // Just for Cloud9
	
		$('#onde-panel').html()
		if (self.ondeSession !== undefined && self.ondeSession !== null) {
			delete self.ondeSession
		}
		self.ondeSession = new onde.Onde($('#onde-settings-form'))
		  // Render the form with the schema
	    self.config.inactive = $.extend({}, self.config.active)  
	    self.ondeSession.render(self.config.schema, self.config.inactive, {
	    	collapsedCollapsibles: false
		})				
		  
		// Bind our form's submit event. We use this to get the data out from Onde
		$('#onde-settings-form').submit(function (evt) {
		    evt.preventDefault()
		    if (self.ondeSession) {
			    var outData = self.ondeSession.getData()
			    if (outData.errorCount) {
			        alert("There are " + outData.errorCount + " errors. Check your config")
			    } else {
			        console.log(JSON.stringify(outData.data, null, "  "))
			        self.config.activate(outData.data)
			        delete self.ondeSession
			        // Close window
			        self.common.closeWindow()
			    }			    	
		    }
		    return false
		})	    			
	})
}

/* Mouse events
============================================================================= */

ConfigPage.prototype.saveSettings = function() {
}

/* Module exports
============================================================================= */

module.exports = new ConfigPage()
