'use strict';

var Core = require('./distribution/core').default;
var config = require('./dist/app-config');
var TestRunner = require("@swift-developer/swiftest").TestRunner;

var run = function run() {
  // build app
  var application = new Core(config);

  // create the test runner
  var testRunner = new TestRunner(application);

  // run the tests
  testRunner.test();
};

setTimeout(run, 1);
