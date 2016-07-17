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

    uglify: {
      dist: {
        files: {
          // 'build/js/ext/foo.min.js': ['src/js/ext/foo.js']
        }
      }
    },

    sass: {
      dist: {
        options: {
          style: 'compressed',
          sourcemap: 'none'
        },
        files: [{
          expand: true,
          cwd: 'src/css',
          src: ['**/*.sass'],
          dest: 'build/css',
          ext: '.min.css'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'build/html/designer.min.html': 'src/html/designer.html'
        }
      }
    },

    replace: {
      dist: {
        options: {
          patterns: [{
            match: 'designerCSS',
            replacement: util.inspect(grunt.file.read('build/css/designer.min.css'))
          }, {
            match: 'designerHTML',
            replacement: util.inspect(grunt.file.read('build/html/designer.min.html'))
          }]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['src/designer.js'],
          dest: 'src'
        }]
      }
    },

    watch: {
      files: ['Gruntfile.js', 'src/js/**/*.js', 'src/css/**/*.css', 'src/html/**/*.html'],
      tasks: ['concat', 'uglify', 'sass', 'htmlmin', 'replace']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['concat', 'uglify', 'sass', 'htmlmin', 'replace', 'watch']);

};
