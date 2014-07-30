/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint asi: true*/

var debug = require('debug')('overwolf-glclock:main')

var overwolf = global.overwolf

var $ = require('jquery'),
    THREE = require('THREE')

/* Submodules
============================================================================= */

var common = require('../common')

/* Module
============================================================================= */

function Application() {
    var self = this

    this.common = common
    this.templates = require('../../dist/tmp/main/templates.js')
    
    this.content = null
    
    this.scene = null
    this.camera = null
    this.renderer = null
    this.projector = null
    
    this.objects = []
    
    this.container = null
    this.clock = null
    this.arrowHr = null
    this.arrowMin = null
    this.arrowSec = null
    this.timeHr = null
    this.timeMin = null
    this.timeSec = null
}

/* Implementation
============================================================================= */

Application.prototype.start = function() {
    var self = this

    console.log('Location:', window.location)
    console.log('Overwolf:', overwolf)

    self.container = $('#webgl-clock')

    // create main scene
    this.scene = new THREE.Scene();

    var SCREEN_WIDTH = window.innerWidth - 30,
        SCREEN_HEIGHT = window.innerHeight - 30;

    // prepare camera
    var VIEW_ANGLE = 45,
        ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
        NEAR = 1,
        FAR = 5000;
    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(0, 1500, 500);
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    // prepare renderer
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    //this.renderer.setClearColor(0xffffff);

    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapSoft = true;
    
    // prepare projector
    this.projector = new THREE.Projector();

    // prepare container
    this.container[0].appendChild(this.renderer.domElement);

    // prepare clock
    this.clock = new THREE.Clock();

    // add dial shape
    var dialMesh = new THREE.Mesh(
        new THREE.CircleGeometry(500, 50),
        new THREE.MeshLambertMaterial({
            color: 0xEEEEFF,
            opacity: 0.5
        })
    );
    dialMesh.rotation.x = - Math.PI / 2;
    dialMesh.position.y = 0;
    this.scene.add(dialMesh);
    this.objects.push(dialMesh);

    // add self rim shape
    var rimMesh = new THREE.Mesh(
      new THREE.TorusGeometry(500, 20, 10, 100),
      new THREE.MeshBasicMaterial({ color:0xffffff })
    );
    rimMesh.rotation.x = - Math.PI / 2;
    this.scene.add(rimMesh);
    this.objects.push(rimMesh);

    // add self arrow
    var iHours = 12;
    var mergedArrows = new THREE.Geometry();
    var extrudeOpts = {amount: 10, steps: 1, bevelSegments: 1, bevelSize: 1, bevelThickness:1};
    var handFrom = 400, handTo = 450;
    var a = 1
    
    for (var i = 1; i <= iHours; i++) {

      // prepare each arrow in a circle
      var arrowShape = new THREE.Shape();

      var from = (i % 3 === 0) ? 350 : handFrom;

      a = i * Math.PI / iHours * 2;
      arrowShape.moveTo(Math.cos(a) * from, Math.sin(a) * from);
      arrowShape.lineTo(Math.cos(a) * from + 5, Math.sin(a) * from + 5);
      arrowShape.lineTo(Math.cos(a) * handTo + 5, Math.sin(a) * handTo + 5);
      arrowShape.lineTo(Math.cos(a) * handTo, Math.sin(a) * handTo);

      var arrowGeom = new THREE.ExtrudeGeometry(arrowShape, extrudeOpts);
      THREE.GeometryUtils.merge(mergedArrows, arrowGeom);
    }
    
    var arrowsMesh = new THREE.Mesh(mergedArrows, new THREE.MeshBasicMaterial({ color:0xffffff }));
    arrowsMesh.rotation.x = - Math.PI / 2;
    arrowsMesh.position.y = 10;
    this.scene.add(arrowsMesh);
    this.objects.push(arrowsMesh);

    // add seconds arrow
    handTo = 350;
    var arrowSecShape = new THREE.Shape();
    arrowSecShape.moveTo(-50, -5);
    arrowSecShape.lineTo(Math.cos(a) * handTo, Math.sin(a) * handTo);
    arrowSecShape.lineTo(-50, 5);

    var arrowSecGeom = new THREE.ExtrudeGeometry(arrowSecShape, extrudeOpts);
    this.arrowSec = new THREE.Mesh(arrowSecGeom, new THREE.MeshBasicMaterial({ color:0xffffff }));
    this.arrowSec.rotation.x = - Math.PI / 2;
    this.arrowSec.position.y = 20;
    this.scene.add(this.arrowSec);
    this.objects.push(this.arrowSec);

    // add minutes arrow
    var arrowMinShape = new THREE.Shape();
    arrowMinShape.moveTo(0, -5);
    arrowMinShape.lineTo(Math.cos(a) * handTo, Math.sin(a) * handTo - 5);
    arrowMinShape.lineTo(Math.cos(a) * handTo, Math.sin(a) * handTo + 5);
    arrowMinShape.lineTo(0, 5);

    var arrowMinGeom = new THREE.ExtrudeGeometry(arrowMinShape, extrudeOpts);
    this.arrowMin = new THREE.Mesh(arrowMinGeom, new THREE.MeshBasicMaterial({ color:0xffffff }));
    this.arrowMin.rotation.x = - Math.PI / 2;
    this.arrowMin.position.y = 20;
    this.scene.add(this.arrowMin);
    this.objects.push(this.arrowMin);

    // add hours arrow
    handTo = 300;
    var arrowHrShape = new THREE.Shape();
    arrowHrShape.moveTo(0, -5);
    arrowHrShape.lineTo(Math.cos(a) * handTo, Math.sin(a) * handTo - 5);
    arrowHrShape.lineTo(Math.cos(a) * handTo, Math.sin(a) * handTo + 5);
    arrowHrShape.lineTo(0, 5);

    var arrowHrGeom = new THREE.ExtrudeGeometry(arrowHrShape, extrudeOpts);
    this.arrowHr = new THREE.Mesh(arrowHrGeom, new THREE.MeshBasicMaterial({ color:0xffffff }));
    this.arrowHr.rotation.x = - Math.PI / 2;
    this.arrowHr.position.y = 20;
    this.scene.add(this.arrowHr);
    this.objects.push(this.arrowHr);

    self.container.mousedown(function() {
        common.dragMove()
    })
    
	document.addEventListener('mousedown', function(event) {
		event.preventDefault();

		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		self.projector.unprojectVector( vector, self.camera );

		var raycaster = new THREE.Raycaster( self.camera.position, vector.sub( self.camera.position ).normalize() );

		var intersects = raycaster.intersectObjects( self.objects );

		if ( intersects.length > 0 ) {
			common.dragMove()
		}
	}, false)

    // Browser Animation Loop
    var animate = function() {
        self.update();

        requestAnimationFrame(animate);
        self.render()
    };
    animate();
}


Application.prototype.update = function() {
    var self = this
    
    // get current time
    var date = new Date();
    self.timeSec = date.getSeconds();
    self.timeMin = date.getMinutes();
    self.timeHr = date.getHours();
    
    self.camera.rotation.z = 0;

    // update self arrows positions
    var rotSec = self.timeSec * 2 * Math.PI / 60 - Math.PI/2;
    self.arrowSec.rotation.z = -rotSec;

    var rotMin = self.timeMin * 2 * Math.PI / 60 - Math.PI/2;
    self.arrowMin.rotation.z = -rotMin;

    var rotHr = self.timeHr * 2 * Math.PI / 12 - Math.PI/2;
    self.arrowHr.rotation.z = -rotHr;
}


Application.prototype.render = function() {
    var self = this
    
    if (self.renderer) {
        self.renderer.render(self.scene, self.camera);
    }
}
    

/* Exports
============================================================================= */

var app = new Application()

module.exports = app
global.app = app

/* Autostart
============================================================================= */

$(document).ready(function() {
    app.start();
})