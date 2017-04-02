import { SingletonLayer } from '@swift-developer/swifty-layer-utils';
import Route from '../routing/route';

var Router = class Router extends SingletonLayer {
  constructor() {
    super();
    this.routes = [];
    this.fullpath = '';

    this.route = (...args) => {
      var newRoute = new Route(this, ...args);
      this.routes.push(newRoute);
    }

    this.map();
  }

  /**
   * [getResourcePathForRequest get an Array of Routes that will fulfill the request]
   * @param  {[Request]} req Request object from Node.js http
   * @return {[Array<Route>]}     Array of Routes to handle the request with.
   */
  getResourcePathForRequest(req) {
    var requestPath = [];

    // create a recursive function to look through the router with
    var buildRequestPath = function(primary) {
      primary.routes.forEach(function(secondary) {
        // look to see if the route is a parent of the route we are looking for
        if (req.url.includes(secondary.fullpath)) {
          // it is so we push it into the request path and look as deep as we can
          requestPath.push(secondary);
          buildRequestPath(secondary);
        } else {
          // check if we found the deepest route
          if (secondary.fullpath === req.url) {
            // found it!
            requestPath.push(secondary);
          }
        }
      });
    }

    // look through the router recursively and append to the requestPath array in this scope
    buildRequestPath(this);

    return requestPath;
  }

  // Override apply method for Layer to do nothing
  define() {}
}

Router.prototype.constructor.__setLayerKey__ = function(filePath) {
  return {
    type: 'core',
    name: 'router'
  };
}

export default Router;
