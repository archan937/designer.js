// Based on http://mattwatson.codes/compile-scss-javascript-grunt/

(function () {
   'use strict';
}());

var util = require('util');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

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
          'build/html/toolbar.min.html': 'src/html/toolbar.html'
        }
      }
    },

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

    replace: {
      dist: {
        options: {
          patterns: [{
            match: 'toolbarCSS',
            replacement: function() {
              return util.inspect(grunt.file.read('build/css/toolbar.min.css'));
            }
          }, {
            match: 'elementsCSS',
            replacement: function() {
              return util.inspect(grunt.file.read('build/css/elements.min.css'));
            }
          }, {
            match: 'toolbarHTML',
            replacement: function() {
              return util.inspect(grunt.file.read('build/html/toolbar.min.html'));
            }
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
      files: ['Gruntfile.js', 'src/css/**/*.sass', 'src/html/**/*.html', 'src/js/**/*.js'],
      tasks: ['sass', 'htmlmin', 'concat', 'uglify', 'replace']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['sass', 'htmlmin', 'concat', 'uglify', 'replace', 'watch']);

};
