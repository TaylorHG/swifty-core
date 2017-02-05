'use strict';

var Core = require('./distribution/core').default;
var config = require('./test-app/app-config');
var SwiftyWatcher = require('@swift-developer/swifty-watcher').default

var run = function run() {
  // build app
  var application = new Core(config);

  const appName = 'test-app';

  // watch files for changes and load changes into resolver
  new SwiftyWatcher(application.get('resolver')).watch(appName);

  // run app
  application.run();
};

setTimeout(run, 1);
