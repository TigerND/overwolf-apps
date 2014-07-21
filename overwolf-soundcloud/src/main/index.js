/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-soundcloud:main')

var $ = require('jquery')

/* Submodules
============================================================================= */

var common = require('../common')

/* Module
============================================================================= */

function Application() {
    var self = this

    this.common = common

    this.templates = require('../../dist/tmp/main/templates.js')
    
    this.ready = false
    this.iframe = null
    this.widget = null
    
    this.startPlaylist = 'https://soundcloud.com/alex-zykov-1/sets/epic-music'
}

/* Helpers
============================================================================= */

Application.prototype.ifReady = function(cb) {
	var self = this
	
	if (self.widget && self.ready) {
		cb(self.widget)
	}
}

/* Implementation
============================================================================= */

Application.prototype.start = function() {
    var self = this

    $(document).ready(function() {    	
        console.log('Location:', window.location)

        overwolf.windows.getCurrentWindow(function(result) {
            if (result.status == 'success') {
                console.log('WindowId:', result.window.id)
                overwolf.windows.changeSize(result.window.id, 400, 26, callback)
            } else {
                console.log('getCurrentWindow:', result.status)
            }
        })

        var $content = $('#content')

        $content.html(self.templates.player({
        	playlist: self.startPlaylist
        }))

        $content.mousedown(function() {
            common.dragMove()
        })

        var iframe = self.iframe = document.getElementById('sc-widget')
        var widget = self.widget = SC.Widget(iframe)

        console.log('Widget:', widget)
        widget.bind(SC.Widget.Events.READY, function(evt) {
            self.ready = true
            console.log('READY:', evt)

            widget.bind(SC.Widget.Events.PLAY, function(evt) {
                console.log('PLAY:', evt)

                self.hidePlayerButton($('#play-button'))
                self.showPlayerButton($('#pause-button'))

                widget.getCurrentSound(function(currentSound) {
                    console.log('Playing:', currentSound);
                    $("#top-menu-sc-track-name").html(currentSound.title)
                })
            })

            widget.bind(SC.Widget.Events.PAUSE, function(evt) {
                console.log('PAUSE:', evt)
                
                self.hidePlayerButton($('#pause-button'))
                self.showPlayerButton($('#play-button'))
            })

            widget.bind(SC.Widget.Events.FINISH, function(evt) {
                console.log('FINISH:', evt)
                
                self.hidePlayerButton($('#pause-button'))
                self.showPlayerButton($('#play-button'))
            })

            widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(evt) {
                widget.setVolume(10)
            })
        })
    })
}

Application.prototype.openHomepage = function() {
    window.open('https://www.ltcrabbit.com/#afc17o')
}

Application.prototype.enablePlayerButton = function($button) {
    $button
        .removeClass('player-button-disabled')
        .removeClass('player-button-hidden')
        .addClass('player-button-enabled')
}

Application.prototype.disablePlayerButton = function($button) {
    $button
        .removeClass('player-button-enabled')
        .removeClass('player-button-hidden')
        .addClass('player-button-disabled')
}

Application.prototype.hidePlayerButton = function($button) {
    $button
        .removeClass('player-button-enabled')
        .removeClass('player-button-disabled')
        .addClass('player-button-hidden')
}

Application.prototype.showPlayerButton = function($button, enabled) {
    $button
        .removeClass('player-button-hidden')
    if (enabled) {
        $button
            .removeClass('player-button-disabled')
            .addClass('player-button-enabled')
    } else {
        $button
            .removeClass('player-button-enabled')
            .addClass('player-button-disabled')
    }
}

Application.prototype.play = function() {
	var self = this
	
    self.ifReady(function(widget) {
        widget.play()
    })
}

Application.prototype.pause = function() {
	var self = this

    self.ifReady(function(widget) {
        widget.pause()
    })
}

Application.prototype.prev = function() {
	var self = this

    self.ifReady(function(widget) {
        widget.prev()
    })
}

Application.prototype.next = function() {
	var self = this

    self.ifReady(function(widget) {
        widget.next()
    })
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