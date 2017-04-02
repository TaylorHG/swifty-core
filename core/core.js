import connect from 'connect';
import http from 'http';
import SwiftyObject from '@swift-developer/swifty-objects';

// import resolver helpers
import Resolver from './resolver/resolver';
import RequestHandler from './request-handler';

// import logging helpers
import { initializeLogger } from '@swift-developer/swifty-logger';
import { LOGGER } from '@swift-developer/swifty-logger';

// export main logging
export { LOGGER };

// export support for resources
import Resource from './common-layers/resource';
export { Resource };

export default class SwiftyCore extends SwiftyObject {
  constructor(config) {
    super();
    // store configuration
    this.config = config;

    // initialize logger
    initializeLogger();

    // build and set Resolver
    this.set('resolver', new Resolver());
  }

  /**
   * Starts a Swifty.js server using the supplied config.
   * @param {Object} configuration necessary to start server
   * @returns {Promise} resolves once the app has finished setting up and is ready for requests.
   */
  run() {
    LOGGER.info('Building Application...');

    // build layers and start application listening on config port
    return new Promise((resolve, reject) => {

      // load handler from config and initialize it.
      var HttpManager = require(this.config.httpManager).default;
      this.set('httpManager', new HttpManager(this.get('resolver')));

      // initialize the resolver, this loads and compiles all modules
      this.get('resolver').init(this.config.appName).then(() => {

        // create connect.js application
        var server = connect();

        // gzip/deflate outgoing responses
        var compression = require('compression');
        server.use(compression());

        // create request handler
        var requestHandler = new RequestHandler(this.get('resolver'), this.get('httpManager'));

        LOGGER.info('Application Built!');
        LOGGER.info('');
        LOGGER.info('');

        // configure connect.js to respond to all requests using the request handler
        server.use(function(req, res) {
          return requestHandler.handleRequest(req, res);
        });

        // create node.js http server and listen on the configured port
        http.createServer(server).listen(this.config.port);

        LOGGER.info(`Listening for requests on port ${this.config.port}...`);

        // result now that the application has finished setting up.
        resolve();
      }, function(err) {
        LOGGER.error(err);
        reject();
      });
    }, function(err) {
      LOGGER.error(err);
    });
  }
}
export var __useDefault = true;
