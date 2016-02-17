/*global module, process*/
/*eslint strict: 0, no-var: 0, no-console: 0 */

var options = {
	// base path that will be used to resolve all patterns (eg. files, exclude)
	basePath: '',

	// frameworks to use
	// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
	frameworks: ['browserify', 'mocha', 'sinon'],

	// list of files / patterns to load in the browser
	files: [
		'http://polyfill.webservices.ft.com/v1/polyfill.js?ua=safari/4',
		'test/*.test.js'
	],

	// list of files to exclude
	exclude: [
	],

	// preprocess matching files before serving them to the browser
	// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
	preprocessors: {
		'test/*.test.js': ['browserify']
	},

	// test results reporter to use
	// possible values: 'dots', 'progress'
	// available reporters: https://npmjs.org/browse/keyword/karma-reporter
	reporters: ['progress'],

	// web server port
	port: 9876,

	// enable / disable colors in the output (reporters and logs)
	colors: true,


	// enable / disable watching file and executing tests whenever any file changes
	autoWatch: true,
	singleRun: false,

	browsers: ['Chrome'],

	// Continuous Integration mode
	// if true, Karma captures browsers, runs the tests and exits

	browserify: {
		debug: true,
		transform: ['babelify', 'debowerify']
	},

	client: {
			mocha: {
					reporter: 'html',
					ui: 'bdd',
					timeout: 0
			}
	},
};

if (process.env.CI) {
  console.log('CI options on.');
  options.browsers = ['PhantomJS'];
  options.autoWatch = false;
  options.singleRun = true;
}

module.exports = function (config) {
  options.logLevel = config.LOG_INFO;
  config.set(options);
};
