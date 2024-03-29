'use strict';

var Core = require('./core/core').default;
var config = require('./dist/app-config');
var SwiftyWatcher = require('@swift-developer/swifty-watcher').default

var run = function run() {
  // build app
  var application = new Core(config);

  // watch files for changes and load changes into resolver
  new SwiftyWatcher(application.get('resolver')).watchApp();

  // run app
  application.run();
};

setTimeout(run, 1);
