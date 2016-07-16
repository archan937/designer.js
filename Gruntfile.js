// Based on http://mattwatson.codes/compile-scss-javascript-grunt/

(function () {
   'use strict';
}());

var util = require('util');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: '\n'
      },
      dist: {
        src: [
          'src/js/mod.js',
          'src/js/modules/*.js',
          'src/js/designer/*.js',
          'src/js/designer.js'
        ],
        dest: 'src/designer.js'
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'src/css',
          src: ['**/*.css'],
          dest: 'build/css',
          ext: '.min.css'
        }]
      }
    },

    uglify: {
      dist: {
        files: {
          // 'build/js/ext/foo.min.js': ['src/js/ext/foo.js']
        }
      }
    },

    replace: {
      dist: {
        options: {
          patterns: [{
          //   match: 'fooJS',
          //   replacement: util.inspect(grunt.file.read('build/js/ext/foo.min.js'))
          // }, {
          //   match: 'designerCSS',
          //   replacement: util.inspect(grunt.file.read('build/css/designer.min.css'))
          }]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['src/designer.js'],
          dest: 'src/'
        }]
      }
    },

    watch: {
      files: ['Gruntfile.js', 'src/js/**/*.js', 'src/css/**/*.css'],
      tasks: ['concat', 'cssmin', 'uglify', 'replace']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['concat', 'cssmin', 'uglify', 'replace', 'watch']);

};
