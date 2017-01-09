'use strict';

var Core = require('./distribution/core').default;
var config = require('./dist/app-config');

var run = function run() {
  var application = new Core();
  application.run(config);
};

setTimeout(run, 1);
