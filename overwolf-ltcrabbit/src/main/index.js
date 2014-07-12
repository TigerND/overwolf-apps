/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('overwolf-ltcrabbit:main')

var $ = require("jquery"),
    THREE = require('three'),
    TWEEN = require('tween.js')

/* Submodules
============================================================================= */

var common = require("../common")

/* Module exports
============================================================================= */

exports.common = common

exports.openHomepage = openHomepage

exports.sc = sc
exports.play = play
exports.pause = pause
exports.prev = prev
exports.next = next

exports.start = start

/* Mouse Events
============================================================================= */

function openHomepage() {
    window.open("https://www.ltcrabbit.com/#afc17o")
}

/* Implementation
============================================================================= */

function detectLanguage(cb) {
    var language = window.navigator.userLanguage || window.navigator.language;
    if (language) {
        cb(language)
    } else {
        $.ajax({
            url: "http://ajaxhttpheaders.appspot.com",
            dataType: 'jsonp',
            success: function(headers) {
                var language = headers['Accept-Language']
                console.log('Language:', language)
                cb(language)
            }
        })
    }
}

function start() {
    $(document).ready(function() {

        console.log('Location:', window.location)

        overwolf.windows.getCurrentWindow(function(result) {
            if (result.status == "success") {
                console.log('WindowId:', result.window.id)
                overwolf.windows.changeSize(result.window.id, 400, 26, callback)
            } else {
                console.log('getCurrentWindow:', result.status)
            }
        })

        var language = window.navigator.userLanguage || window.navigator.language;
        console.log('Language:', language)

        var $content = $('#content')

        $content
            .mousedown(function() {
                common.dragMove()
            })
            .mouseenter(function() {
                // ...
            })
            .mouseleave(function() {
                // ...
            })

        startSoundCloud()
        //startWebGLClock()			
    })
}

/* Sound Cloud
============================================================================= */

window.sc = {
    widget: null,
    ready: false
}

function sc() {
    return window.sc
}

function enablePlayerButton($button) {
    $button
        .removeClass('player-button-disabled')
        .removeClass('player-button-hidden')
        .addClass('player-button-enabled')
}

function disablePlayerButton($button) {
    $button
        .removeClass('player-button-enabled')
        .removeClass('player-button-hidden')
        .addClass('player-button-disabled')
}

function hidePlayerButton($button) {
    $button
        .removeClass('player-button-enabled')
        .removeClass('player-button-disabled')
        .addClass('player-button-hidden')
}

function showPlayerButton($button, enabled) {
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

function startSoundCloud() {
    var widgetIframe = document.getElementById('sc-widget')
    var widget = window.sc.widget = SC.Widget(widgetIframe)

    console.log('Widget:', widget)
    widget.bind(SC.Widget.Events.READY, function(evt) {
        window.sc.ready = true
        console.log('READY:', evt)

        widget.bind(SC.Widget.Events.PLAY, function(evt) {
            console.log('PLAY:', evt)
            hidePlayerButton($('#play-button'))
            showPlayerButton($('#pause-button'))
            // get information about currently playing sound
            widget.getCurrentSound(function(currentSound) {
                console.log('Playing:', currentSound);
                $("#top-menu-sc-track-name").html(currentSound.title)
            })
        })

        widget.bind(SC.Widget.Events.PAUSE, function(evt) {
            console.log('PAUSE:', evt)
            hidePlayerButton($('#pause-button'))
            showPlayerButton($('#play-button'))
        })

        widget.bind(SC.Widget.Events.FINISH, function(evt) {
            console.log('FINISH:', evt)
            hidePlayerButton($('#pause-button'))
            showPlayerButton($('#play-button'))
        })

        widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(evt) {
            widget.setVolume(15)
        })
    })
}

function ifWidgetReady(cb) {
    var widget = sc().widget,
        ready = sc().ready
    if (widget && ready) {
        cb(widget)
    }
}

function play() {
    ifWidgetReady(function(widget) {
        widget.play()
    })
}

function pause() {
    ifWidgetReady(function(widget) {
        widget.pause()
    })
}

function prev() {
    ifWidgetReady(function(widget) {
        widget.prev()
    })
}

function next() {
    ifWidgetReady(function(widget) {
        widget.next()
    })
}

/* WebGL Clock
============================================================================= */

function startWebGLClock() {

    // Dimension Settings
    var width = window.innerWidth - 50,
        height = window.innerHeight - 50;
    var angle = 45,
        aspect = width / height,
        near = 0.1,
        far = 10000;

    // Objects Array
    var objects = []

    // World Objects
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
    var projector = new THREE.Projector();
    var renderer = new THREE.WebGLRenderer({
        alpha: true
    });

    var light = new THREE.SpotLight(0xFFFFFF, 1);
    var material = new THREE.MeshLambertMaterial({
        color: 0xEEEEFF,
        opacity: 0.9
    });
    var grey = new THREE.MeshLambertMaterial({
        color: 0x444444,
        opacity: 0.8
    });
    var red = new THREE.MeshLambertMaterial({
        color: 0xFF0000
    });
    var white = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF
    });

    var geometry = new THREE.CylinderGeometry(20, 21, 4, 48, 1, false);
    var dial = new THREE.Mesh(geometry, material);
    objects.push(dial);

    geometry = new THREE.CubeGeometry(5, 2, 1);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(18, 0, 0));
    var mark = new THREE.Mesh(geometry, grey);
    objects.push(mark);

    geometry = new THREE.CubeGeometry(15, 1, 2);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(15, 0, 0));
    var second = new THREE.Mesh(geometry, red);
    objects.push(second);

    geometry = new THREE.CubeGeometry(12, 1, 3);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(15, 0, 0));
    var minute = new THREE.Mesh(geometry, white);
    objects.push(minute);

    geometry = new THREE.CubeGeometry(10, 1, 4);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(15, 0, 0));
    var hour = new THREE.Mesh(geometry, white);
    objects.push(hour);


    // Positions
    dial.position.x = 0;
    dial.position.y = -3;
    dial.position.z = 0;

    mark.position.x = 0;
    mark.position.y = -1.5;
    mark.position.z = 0;

    second.position.x = 0;
    second.position.y = 0;
    second.position.z = 0;

    minute.position.x = 0;
    minute.position.y = 1;
    minute.position.z = 0;

    hour.position.x = 0;
    hour.position.y = 2;
    hour.position.z = 0;

    light.position.x = 0;
    light.position.y = 100;
    light.position.z = 0;
    light.lookAt(dial.position);

    camera.position.z = 40;
    camera.position.y = 40;
    camera.lookAt(dial.position);


    // Build World
    scene.add(camera);
    scene.add(light);
    scene.add(dial);
    scene.add(mark);
    scene.add(second);
    scene.add(minute);
    scene.add(hour);


    // Shadow
    renderer.shadowMapEnabled = true;

    light.castShadow = true;
    light.shadowCameraNear = 1.0;
    light.shadowDarkness = 0.5;

    dial.castShadow = true;
    dial.receiveShadow = true;

    mark.castShadow = true;
    mark.receiveShadow = true;

    second.castShadow = true;
    second.receiveShadow = true;

    minute.castShadow = true;
    minute.receiveShadow = true;

    hour.castShadow = true;
    hour.receiveShadow = true;


    // Set initial time
    var now = new Date();
    hour.rotation.y = -((Math.PI * 2) * (now.getHours() / 12.0))
    minute.rotation.y = -((Math.PI * 2) * (now.getMinutes() / 60.0))
    second.rotation.y = -((Math.PI * 2) * (now.getSeconds() / 60.0))
    camera.rotation.z = second.rotation.y


    // Render
    renderer.setSize(width, height);
    $('#webgl-clock').append(renderer.domElement);


    // Animation Tween
    var rotation_start = {
        angle: now.getSeconds()
    };
    var rotation_end = {
        angle: rotation_start.angle + 1
    };

    // dataset on hand object? or attribute directly?
    var tween1 = new TWEEN.Tween(rotation_start).to(rotation_end, 1000)
        .easing(TWEEN.Easing.Elastic.InOut)
        //.repeat( Infinity ) couldnt get this to fire 'on complete' to change values.
        .delay(0)
        .onUpdate(function() {
            second.rotation.y = -((Math.PI * 2) * (this.angle / 60.0));
        })
        .onComplete(function() {
            rotation_start.angle = new Date().getSeconds();
            rotation_end.angle = rotation_start.angle + 1;

            // TODO fire off hour/minute animations here?
        })
        .start()

    // questionable? rely on the 1000ms with 0ms delay for accuracy.
    tween1.chain(tween1);


    // Update Method
    var update = function() {
        // delta here
        //second.rotation.y -= 0.0018;
        minute.rotation.y -= 0.0018 / 60;
        hour.rotation.y -= 0.0018 / 60 / 12;
        camera.rotation.z -= 0.0018;
        //mark.rotation.y = (new Date().getTime())/1000
        // it would be cool to see the camera rotate at second speed smooth, while the hand 'ticks' quartz style

        TWEEN.update();
    };


    // Browser Animation Loop
    var animate = function() {
        update();

        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };
    animate();


    // Raycaster
    document.addEventListener('mousedown', function(event) {
        event.preventDefault();

        var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
        projector.unprojectVector(vector, camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        var intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            common.dragMove()
        }
    }, false)
}
