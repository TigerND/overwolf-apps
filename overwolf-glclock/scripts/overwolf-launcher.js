/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var util = require('util'),
    path = require('path'),
    winreg = require('winreg')

var regKey = new winreg({
    hive: winreg.HKLM,
    key: process.arch === 'x64' ? '\\Software\\Wow6432Node\\Overwolf' : '\\Software\\Overwolf'
})

regKey.get('InstallFolder', function(err, value) {
    if (err) {
        console.log('Failed to find Overwolf executable', err)
    } else {
        var launcherBinary = path.join(value.value.toString(), 'Overwolf.exe')
        console.log('Starting', launcherBinary)
        var spawn = require('child_process').spawn,
            nodewebkit = spawn(launcherBinary, [], {
                cwd: './dist',
                env: util._extend({
                    DEBUG: '*'
                }, process.env),
                stdio: 'inherit'
            })
        if (nodewebkit) {
            nodewebkit.on('close', function(code) {
                console.log('Overwolf exited with code:', code)
                process.exit(code)
            })        	
        } else {
        	process.exit(-1)
        }
    }
})
