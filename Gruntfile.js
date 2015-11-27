/* global module:false, require:true */
'use strict';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({

    snippetFooter: grunt.file.read('./js/snippet/snippet.footer.js'),

    clean: {
      js: 'build/'
    },

    uglify: {

      loader: {
        options: {
          beautify: true,
          mangle: false,
          compress: false,
          banner: '(function (window, document, undefined) {' +
            '"use strict";',
          footer: '})(this, document);'
        },
        src: './build/loader/loader.js',
        dest: './build/loader/loader.js'
      },

      loaderMin: {
        options: {
          mangle: true,
          compress: {},
          banner: '(function (window, document, undefined) {' +
            '"use strict";',
          footer: '})(this, document);'
        },
        src: './build/loader/loader.js',
        dest: './build/loader/loader.js'
      },

      snippet: {
        options: {
          beautify: true,
          mangle: true,
          compress: false,
          footer: '<%= snippetFooter %>'
        },
        src: './js/snippet/snippet.js',
        dest: './build/snippet/snippet.js'
      },

      snippetMin: {
        options: {
          mangle: {
            except: ['undefined']
          },
          compress: {},
          footer: '<%= snippetFooter %>'
        },
        src: './js/snippet/snippet.js',
        dest: './build/snippet/snippet.min.js'
      }

    },

    karma: {
      test: {
        configFile: 'karma.conf.js'
      },

      build: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
      }
    },

    webpack: {
      loader: {
        entry: './js/main.js',
        output: {
          path: './build/loader',
          filename: 'loader.js'
        },
        resolve: {
          modulesDirectories: ['web_modules', 'node_modules']
        }
      }
    },

    watch: {
      default: {
        files: [
          'js/**/*.js'
        ],
        tasks: [
          'webpack:loader',
          'uglify:loader'
        ],
        options: {
          spawn: false
        }
      }
    }

  });

  // Load tasks from NPM
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('clean', [
    'clean:js'
  ]);

  grunt.registerTask('devSnippet', [
    'uglify:snippet',
    'watch'
  ]);

  grunt.registerTask('buildSnippet', [
    'uglify:snippetMin'
  ]);

  grunt.registerTask('devApp', [
    'webpack:app',
    'uglify:loader',
    'watch'
  ]);

  grunt.registerTask('buildApp', [
    'webpack:loader',
    'uglify:loaderMin'
  ]);

  grunt.registerTask('test', [
    'karma:test'
  ]);

  grunt.registerTask('dev', [
    'karma:build',
    'webpack:app',
    'watch'
  ]);

  grunt.registerTask('build', [
    'karma:build',
    'buildSnippet',
    'buildApp'
  ]);
};
