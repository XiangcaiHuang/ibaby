module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            css: {
                src: [
                    'lib/css/thirdparty/*.css',
                    'lib/css/freeboard/styles.css'
                ],
                dest: 'css/freeboard.css'
            },
            thirdparty : {
                src : [
                    [
                        'lib/js/thirdparty/head.js',
                        'lib/js/thirdparty/jquery.js',
                        'lib/js/thirdparty/jquery-ui.js',
                        'lib/js/thirdparty/knockout.js',
                        'lib/js/thirdparty/underscore.js',
                        'lib/js/thirdparty/jquery.gridster.js',
                        'lib/js/thirdparty/jquery.caret.js',
						'lib/js/thirdparty/jquery.xdomainrequest.js',
                        'lib/js/thirdparty/codemirror.js',
                    ]
                ],
                dest : 'js/freeboard.thirdparty.js'
            },
			fb : {
				src : [
					'lib/js/freeboard/DatasourceModel.js',
					'lib/js/freeboard/DeveloperConsole.js',
					'lib/js/freeboard/DialogBox.js',
					'lib/js/freeboard/FreeboardModel.js',
					'lib/js/freeboard/FreeboardUI.js',
					'lib/js/freeboard/JSEditor.js',
					'lib/js/freeboard/PaneModel.js',
					'lib/js/freeboard/PluginEditor.js',
					'lib/js/freeboard/ValueEditor.js',
					'lib/js/freeboard/WidgetModel.js',
					'lib/js/freeboard/freeboard.js',
				],
				dest : 'js/freeboard.js'
			},
            plugins : {
                src : [
                    'plugins/freeboard/*.js'
                ],
                dest : 'js/freeboard.plugins.js'
            },
            'fb_plugins' : {
                src : [
                    'js/freeboard.js',
                    'js/freeboard.plugins.js'
                ],
                dest : 'js/freeboard_plugins.js'
            },
            'bower_components' : {
                src : [
                    'bower_components/cryptojslib/rollups/sha256.js',
                    'bower_components/cryptojslib/rollups/hmac-sha256.js',
                    'bower_components/moment/min/moment.min.js',
                    'bower_components/random/lib/random.min.js',
                    'bower_components/paho-mqtt-js/mqttws31.js'
                ],
                dest : 'js/bower_components.js'
            },
        },
        cssmin : {
            css:{
                src: 'css/freeboard.css',
                dest: 'css/freeboard.min.css'
            }
        },
        uglify : {
            fb: {
                files: {
                    'js/freeboard.min.js' : [ 'js/freeboard.js' ]
                }
            },
            plugins: {
                files: {
                    'js/freeboard.plugins.min.js' : [ 'js/freeboard.plugins.js' ]
                }
            },
            thirdparty :{
                options: {
                    mangle : false,
                    beautify : false,
                    compress: {}
                },
                files: {
                    'js/freeboard.thirdparty.min.js' : [ 'js/freeboard.thirdparty.js' ]
                }
            },
            'fb_plugins': {
                files: {
                    'js/freeboard_plugins.min.js' : [ 'js/freeboard_plugins.js' ]
                }
            },
            'bower_components': {
                files: {
                    'js/bower_components.min.js' : [ 'js/bower_components.js' ]
                }
            },
        },
        'string-replace': {
            css: {
                files: {
                    'css/': 'css/*.css'
                },
                options: {
                    replacements: [{
                        pattern: /..\/..\/..\/img/ig,
                        replacement: '../img'
                    }]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.registerTask('default', [ 'concat:css', 'cssmin:css',
        'concat:fb', 'concat:thirdparty', 'concat:plugins', 'concat:fb_plugins', 'concat:bower_components',
        'uglify:fb', 'uglify:plugins', 'uglify:fb_plugins', 'uglify:thirdparty', 'uglify:bower_components',
        'string-replace:css' ]);
};
