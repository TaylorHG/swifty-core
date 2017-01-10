'use strict';

var Core = require('./distribution/core').default;
var config = require('./dist/app-config');
var SwiftyWatcher = require('@swift-developer/swifty-watcher').default

var run = function run() {
  // build app
  var application = new Core();
  // watch files for changes and load changes into resolver
  new SwiftyWatcher(application.get('resolver')).watchApp();

  // run app
  application.run(config);
};

setTimeout(run, 1);
