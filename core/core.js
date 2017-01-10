import connect from 'connect';
import http from 'http';

import Resolver from './resolver/resolver';
import RequestHandler from './request-handler';
import SwiftyObject from '@swift-developer/swifty-objects';

import watch from 'watch';
import colors from 'colors/safe';

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

      console.log(`Start watching files in "${process.cwd()}/app" for updates...`);
      // start watching files and compile them as you go.
      watch.createMonitor(`${process.cwd()}/app`, { interval: 0.1 }, function (monitor) {
        monitor.on("created", function (f, stat) {
          // Handle new files
          var regex = new RegExp("^" + `${process.cwd()}/app`);
          console.log(colors.green('[+] created new file: ') + f.replace(regex, ''));
          _this.get('resolver').addLayerByFileName(f).then(function(layerContainer) {
            console.log(`Layer registered: ${layerContainer.layerKey.type}:${layerContainer.layerKey.name}\n`);
          });
        })
        monitor.on("changed", function (f, curr, prev) {
          // Handle file changes
          var regex = new RegExp("^" + `${process.cwd()}/app`);
          console.log(colors.blue('[~] changed file: ') + f.replace(regex, ''));
          _this.get('resolver').addLayerByFileName(f).then(function(layerContainer) {
            console.log(`Layer re-registered: ${layerContainer.layerKey.type}:${layerContainer.layerKey.name}\n`);
          });
        })
        monitor.on("removed", function (f, stat) {
          // Handle removed files
          var regex = new RegExp("^" + `${process.cwd()}/app`);
          console.log(colors.red('[-] removed file: ') + f.replace(regex, ''));
          _this.get('resolver').removeLayerByFileName(f).then(function(layerContainer) {
            console.log(`Layer de-registered: ${layerContainer.layerKey.type}:${layerContainer.layerKey.name}\n`);
          });
        })
      })
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
