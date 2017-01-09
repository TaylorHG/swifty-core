import connect from 'connect';
import http from 'http';

import Resolver from './resolver';
import SwiftyObject from '@swift-developer/swifty-objects';

class RequestHandler {
  constructor(resolver, handler) {
    this.resolver = resolver;
    this.handler = handler;
  }

  handleRequest(req, res) {
    // look through controllers to find one for this request.
    var Controller = this.handler.getControllerForRequest(req);

    // setup the controller
    var controllerForRequest = new Controller();
    controllerForRequest.setup();

    // use handler to determine correct method to handle this request
    var method = this.handler.findControllerMethod(req, Controller);

    // TODO: inject necessary layers and create a path through them for the request

    // TODO: handle the request by passing it through all injected layers

    // for now i'm just gonna go with this:
    controllerForRequest[method].apply(req, res);
  }
}


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

      console.log('Application Built!\n\n\n');

      // configure connect.js to respond to all requests using the request handler
      app.use(function(req, res) {
        return requestHandler.handleRequest(req, res);
      });

      //create node.js http server and listen on port 1337
      http.createServer(app).listen(config.port);
      console.log(`Listening for requests on port ${config.port}...`);
    }, function(err) {
      console.error(err);
    });

  }
}
export var __useDefault = true;
