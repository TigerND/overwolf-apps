/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    handlebars = require('handlebars'),
    child_process = require('child_process')

var spawn = child_process.spawn

var pid = null

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    var pkg = grunt.file.readJSON('package.json')

    grunt.initConfig({
        pkg: pkg,

        dirs: {
            dist: './dist',
            pkg: './dist/package',
            tmp: './dist/tmp'
        },

        jshint: {
            files: ['package.json', 'Gruntfile.js', 'src/**/*.json', 'src/**/*.js', 'scripts/**/*.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },

        handlebars: {
            main: {
                options: {
                    namespace: 'main',
                    processName: function(filename) {
                        return path.basename(filename, '.html')
                    },
                    node: true
                },
                files: {
                    "<%= dirs.tmp %>/main/templates.js": ["src/main/templates/**/*.html"],
                }
            }
        },

        browserify: {
            main: {
                bundleOptions: {
                    debug: true
                },
                options: {
                    alias: ['src/main/index.js:app'],
                },
                files: {
                    '<%= dirs.pkg %>/main/app.js': ['src/main/index.js']
                }
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            main: {
                files: {
                    '<%= dirs.pkg %>/main/app.min.js': ['<%= dirs.pkg %>/main/app.js']
                }
            }
        },

        stylus: {
            compile: {
                options: {
                    urlfunc: {
                        name: 'embedurl',
                        limit: false,
                        paths: []
                    },
                    use: [
                        require('nib'),
                        //require('fluidity')
                    ],
                    import: [
                        'nib',
                        //'fluidity'
                    ],
                    'resolve url': true
                },
                files: {
                    '<%= dirs.pkg %>/contrib/css/font-awesome.css': ['contrib/css/font-awesome.css'],
                    '<%= dirs.pkg %>/main/app.css': ['src/common/**/*.css', 'src/main/**/*.css']
                }
            }
        },

        cssmin: {
            main: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                    report: 'gzip'
                },
                files: {
                    '<%= dirs.pkg %>/contrib/css/font-awesome.min.css': ['<%= dirs.pkg %>/contrib/css/font-awesome.css'],
                    '<%= dirs.pkg %>/main/app.min.css': ['<%= dirs.pkg %>/main/app.css']
                }
            }
        },

        copy: {
            manifest: {
                src: 'src/manifest.json',
                dest: '<%= dirs.pkg %>/manifest.json',
                options: {
                    process: function(content, srcpath) {
                        var template = handlebars.compile(content)
                        return template({
                            pkg: pkg
                        })
                    }
                }
            },
            icons: {
                expand: true,
                cwd: 'src/icons/',
                src: '**',
                dest: '<%= dirs.pkg %>/icons/'
            },
            main: {
                expand: true,
                cwd: 'src/main/public',
                src: '**',
                dest: '<%= dirs.pkg %>/main'
            },
            contrib: {
                expand: true,
                cwd: 'contrib/',
                src: '**',
                dest: '<%= dirs.pkg %>/contrib/'
            }
        },

        zip: {
            opk: {
                dest: '<%= dirs.dist %>/<%= pkg.name %>.opk',
                src: ['<%= dirs.pkg %>/**/*'],
                cwd: '<%= dirs.pkg %>'
            }
        },

        watch: {
            options: {
                livereload: true
            },
            src: {
                files: ['<%= jshint.files %>', 'contrib/**/*.js', 'contrib/**/*.css', 'src/**/*.html', 'src/**/*.css'],
                tasks: ['stop_overwolf', 'build', 'start_overwolf'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.registerTask('default', ['build'])

    grunt.registerTask('build', ['copy', 'handlebars', 'jshint', 'browserify', 'stylus', 'uglify', 'cssmin', 'zip'])

    grunt.registerTask('devel', ['build', 'start_overwolf', 'watch'])

    grunt.registerTask('restart_overwolf', ['stop_overwolf', 'start_overwolf'])

    grunt.registerTask('start_overwolf', 'Start Overwolf', function() {
        var done = this.async()

        var launcher = spawn('node', ['scripts/overwolf-launcher.js'], {
            stdio: 'inherit'
        })

        if (launcher) {
            pid = launcher.pid
            grunt.log.ok(['Launcher started', ' PID: ' + pid])
            launcher.on('close', function(code) {
                grunt.log.writeln('Launcher exited with code:', code)
                pid = null
            })
            done()
        } else {
            grunt.log.error(['Failed to start launcher'])
            done(false)
        }
    })

    grunt.registerTask('stop_overwolf', 'Stop Overwolf', function() {
        var done = this.async()

        if (pid) {
            grunt.log.writeln('Killing ' + pid)
            process.kill(pid, 'SIGKILL')
            pid = null
            grunt.log.writeln('Waiting 2 seconds')
            setTimeout(function() {
                done()
            }, 2000)
        } else {
            grunt.log.ok(['Launcher has already finished'])
            done()
        }
    })
};
