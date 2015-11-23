// Karma configuration
// Generated on Thu Oct 15 2015 22:14:00 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['qunit'],


    // list of files / patterns to load in the browser
    files: [
      { pattern: 'lib/timbre.js', watched: false},
      { pattern: 'lib/*.js', watched: false },
      'js/util.js',
      'js/event.js',
      'js/dom.js',
      //'js/block.js',
      'js/file.js',
      'js/queryparams.js',
      'js/undo.js',
      //'js/app*.js',
      'js/widget.js',
      'js/runtime.js',
      'test/test-helpers.js',
      'test/sinon-1.12.2.js',
      'test/runtime.js',
    //   'test/all-blocks-have-functions.js'
    ],


    // list of files to exclude
    exclude: [
      'lib/ga.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'js/*.js': ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  })
}
