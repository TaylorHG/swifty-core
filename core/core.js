import connect from 'connect';
import http from 'http';
import SwiftyObject from '@swift-developer/swifty-objects';

import Resolver from './resolver/resolver';
import RequestHandler from './request-handler';

// export support for resources
import Resource from './common-layers/resource';
export { Resource };

export default class SwiftyCore extends SwiftyObject {
  constructor() {
    super();
    // build and set Resolver
    this.set('resolver', new Resolver());
  }

  /**
   * Starts a Swifty.js server using the supplied config.
   * @param {Object} configuration necessary to start server
   * @returns {Promise} resolves once the app has finished setting up and is ready for requests.
   */
  run(config) {
    console.log('Building Application...');

    return new Promise((resolve, reject) => {
      // load handler from config and initialize it.
      var HttpManager = require(config.httpManager).default;
      // var HttpManager = SwiftyRestHandler;
      this.set('httpManager', new HttpManager(this.get('resolver')));

      // initialize the resolver
      this.get('resolver').init().then(() => {
        // create connect.js application
        var app = connect();

        // gzip/deflate outgoing responses
        var compression = require('compression');
        app.use(compression());

        // create request handler
        var requestHandler = new RequestHandler(this.get('resolver'), this.get('httpManager'));

        console.log('Application Built!\n\n\n');

        // configure connect.js to respond to all requests using the request handler
        app.use(function(req, res) {
          return requestHandler.handleRequest(req, res);
        });

        //create node.js http server and listen on the configured port
        http.createServer(app).listen(config.port);

        console.log(`Listening for requests on port ${config.port}...`);

        // result now that the application has finished setting up.
        resolve();
      }, function(err) {
        console.error(err);
        reject();
      });
    }, function(err) {
      console.error(err);
    });
  }
}
export var __useDefault = true;
