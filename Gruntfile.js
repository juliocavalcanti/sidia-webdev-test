'use strict';

var request = require('request');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'app.js'
      }
    },
    less: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'public/css/style.css': 'public/less/style.less'
        }
      } 
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      server: {
        files: [
          'app.js',
          'routes/*.js'
        ],
        tasks: ['develop', 'delayed-livereload']
      },
      js: {
        files: ['public/js/*.js'],
        options: {
          livereload: reloadPort
        }
      },
      css: {
        files: '**/*.less',
        tasks: ['less'],
        options: {
          livereload: reloadPort
        }
      },
      jade: {
        files: ['views/*.jade'],
        options: {
          livereload: reloadPort
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default');

};