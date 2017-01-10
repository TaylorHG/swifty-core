import connect from 'connect';
import http from 'http';
import SwiftyObject from '@swift-developer/swifty-objects';

import Resolver from './resolver/resolver';
import RequestHandler from './request-handler';
import AppWatcher from './app-watcher';

export default class SwiftyCore extends SwiftyObject {
  constructor() {
    super();
    // build and set Resolver
    this.set('resolver', new Resolver());
  }

  run(config) {
    console.log('Building Application...');
    var _this = this;

    // load handler from config and initialize it.
    var HttpManager = require(config.httpManager).default;
    this.set('httpManager', new HttpManager(this.get('resolver')));

    // initialize the resolver
    this.get('resolver').init().then(function() {
      // create connect.js application
      var app = connect();

      // gzip/deflate outgoing responses
      var compression = require('compression');
      app.use(compression());

      // create request handler
      var requestHandler = new RequestHandler(_this.get('resolver'), _this.get('httpManager'));

      // watch files for changes and load changes into resolver
      new AppWatcher(_this.get('resolver')).watchApp();
      console.log('Application Built!\n\n\n');

      // configure connect.js to respond to all requests using the request handler
      app.use(function(req, res) {
        return requestHandler.handleRequest(req, res);
      });

      //create node.js http server and listen on the configured port
      http.createServer(app).listen(config.port);
      console.log(`Listening for requests on port ${config.port}...`);
    }, function(err) {
      console.error(err);
    });

  }
}
export var __useDefault = true;
