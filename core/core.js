import connect from 'connect';
import http from 'http';
import SwiftyObject from '@swift-developer/swifty-objects';

import Resolver from './resolver/resolver';
import RequestHandler from './request-handler';

export class SwiftyRestHandler {
  constructor(resolver) {
    this.resolver = resolver;
  }

  getControllerForRequest(req) {
    var cleanUrl = req.url.slice(1);
    var controller;

    if (this.resolver.getLayerByKey(`controller:${cleanUrl}`) !== undefined) {
      // the request is made to the root of a given route
      return `controller:${cleanUrl}`;
    } else {
      // couldn't find a controller with this path, maybe there is a path param...
      cleanUrl = cleanUrl.replace(/\/[^\/]*$/, '');
      if (this.resolver.getLayerByKey(`controller:${cleanUrl}`) !== undefined) {
        return `controller:${cleanUrl}`;
      }
    }

    // suitable controller was not found!
    console.error('Could not find controller for this request!');
  }

  findControllerMethod(req, ControllerKlass) {
    var requestHandlers = ControllerKlass.prototype.__requestHandlers__;
    var method;

    // iterate through controller properties and find the proper request method for this request
    for (let availableHandler in requestHandlers) {
      var requestHandler = requestHandlers[availableHandler];
      // check if the request is for this HTTP Method
      if (requestHandler.method === req.method) {
        // check if property is for routes with nested values
        if (requestHandler.path === '/:id') {
          // check if request is not to the root level of this route
          if (req.url.replace(ControllerKlass.__controllerConf__.path, '') !== '') {
            return availableHandler;
          }
        } else {
          // check if request is for a root level request
          if (requestHandler.path === req.url.replace(ControllerKlass.__controllerConf__.path, '')) {
            return availableHandler;
          }
        }
      }
    }
    console.error('Could not find method for request!');
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
    // var HttpManager = require(config.httpManager).default;
    var HttpManager = SwiftyRestHandler;
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

      //create node.js http server and listen on the configured port
      http.createServer(app).listen(config.port);
      console.log(`Listening for requests on port ${config.port}...`);
    }, function(err) {
      console.error(err);
    });

  }
}
export var __useDefault = true;
