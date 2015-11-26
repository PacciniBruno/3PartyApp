// Karma configuration
// Generated on Fri Jul 31 2015 18:18:28 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [
      'sinon',
      'tap',
    ],

    plugins: [
      'karma-tap',
      'karma-sinon',
      'karma-chrome-launcher',
      'karma-webpack',
      'karma-sourcemap-loader',
      // For some reason I can't get karma to launch Firefox... To investigate
      // 'karma-firefox-launcher',
      'karma-phantomjs-launcher',
    ],

    files: [
      'test/test_index.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/test_index.js': ['webpack', 'sourcemap']
    },

    webpack: {
      node: {
        fs:'empty'
      },

      devtool: 'inline-source-map'
    },

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // noInfo: true
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'Chrome',
      // 'Firefox',
      // 'Safari',
      //'PhantomJS'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
