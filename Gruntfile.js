// Based on http://mattwatson.codes/compile-scss-javascript-grunt/

(function () {
   'use strict';
}());

var util = require('util');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      main: {
        files: [{
          expand: true,
          cwd: 'src/fonts/ext',
          src: ['**'],
          dest: 'build/css/ext/fonts'
        }, {
          expand: true,
          cwd: 'src/js/ext',
          src: ['**'],
          dest: 'build/js/ext'
        }],
      },
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

    embedFonts: {
      all: {
        files: {
          'build/css/ext/font-awesome.min.css': ['build/css/ext/font-awesome.min.css']
        }
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'build/html/designer/toolbar.min.html': 'src/html/designer/toolbar.html',
          'build/html/designer/editor.min.html': 'src/html/designer/editor.html'
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
        dest: 'build/js/designer.js'
      }
    },

    replace: {
      dist: {
        files: [{
          expand: true,
          flatten: true,
          src: ['build/js/designer.js'],
          dest: 'build/js'
        }],
        options: {
          patterns: [{
            match: 'fontAwesomeCSS',
            replacement: function() {
              return util.inspect(grunt.file.read('build/css/ext/font-awesome.min.css').replace(/(src:|,)url\(\.\/fonts\/.*?\);/g, ''));
            }
          }, {
            match: 'iframeCSS',
            replacement: function() {
              return util.inspect(grunt.file.read('build/css/designer/iframe.min.css'));
            }
          }, {
            match: 'elementsCSS',
            replacement: function() {
              return util.inspect(grunt.file.read('build/css/designer/elements.min.css'));
            }
          }, {
            match: 'toolbarCSS',
            replacement: function() {
              return util.inspect(grunt.file.read('build/css/designer/toolbar.min.css'));
            }
          }, {
            match: 'editorCSS',
            replacement: function() {
              return util.inspect(grunt.file.read('build/css/designer/editor.min.css'));
            }
          }, {
            match: 'toolbarHTML',
            replacement: function() {
              return util.inspect(grunt.file.read('build/html/designer/toolbar.min.html'));
            }
          }, {
            match: 'editorHTML',
            replacement: function() {
              return util.inspect(grunt.file.read('build/html/designer/editor.min.html'));
            }
          }]
        }
      }
    },

    watch: {
      files: ['Gruntfile.js', 'src/js/**/*.js', 'src/css/**/*.{sass,css}', 'src/html/**/*.html'],
      tasks: ['copy', 'sass', 'cssmin', 'embedFonts', 'htmlmin', 'concat', 'replace']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-embed-fonts');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['copy', 'sass', 'cssmin', 'embedFonts', 'htmlmin', 'concat', 'replace', 'watch']);

};
