import { SingletonLayer } from '@swift-developer/swifty-layer-utils';

var Resource = class Resource extends SingletonLayer {

  // Override apply method for Layer to do nothing
  define() {}

  /**
   * Insure that all the fields on the requestHandler for a given method are instantiated and ready to be added to.
   * @param {String} key is the name of the function on the controller that the layers will apply to.
   */
  __prepareForLayerInsertion__(key) {
    if (this.__requestHandlers__ === undefined) {
      this.__requestHandlers__ = {};
    }

    if (this.__requestHandlers__[key] === undefined) {
      var requestHandler = {
        preLayers: [],
        postLayers: []
      }
      this.__requestHandlers__[key] = requestHandler;
    } else {
      if (this.__requestHandlers__[key].preLayers === undefined) {
        this.__requestHandlers__[key].preLayers = [];
      }
      if (this.__requestHandlers__[key].postLayers === undefined) {
        this.__requestHandlers__[key].postLayers = [];
      }
    }
  }

  /**
   * Prepends a layer to one of this Resource's request handlers.
   * This means the requestSession will be passed through this newly added Layer before it is sent
   * to the Resource's request handler.
   *
   * This is an great way to add logic such as authorization or adapters to change or manipulate the data.
   *
   * @param {String} requestHandlerName name of the request Handler (ex. index, get, graphql, etc.)
   * @param {String} layerKey is the key of the Layer to use.
   */
  __prependLayerByKey__(requestHandlerName, layerKey) {
    this.__prepareForLayerInsertion__(requestHandlerName);
    this.__requestHandlers__[requestHandlerName].preLayers.push(layerKey);
  }

  /**
   * Appends a layer to one of this Resource's request handlers.
   * This means the requestSession will be passed through this newly added Layer before it is sent
   * to the Resource's request handler.
   *
   * This is an great way to add logic such as serialization or request logging.
   *
   * @param {String} requestHandlerName name of the request Handler (ex. index, get, graphql, etc.)
   * @param {String} layerKey is the requestHandlerName of the Layer to use.
   */
  __appendLayerByKey__(requestHandlerName, layerKey) {
    this.__prepareForLayerInsertion__(requestHandlerName);
    this.__requestHandlers__[requestHandlerName].postLayers.push(layerKey);
  }
}

Resource.prototype.constructor.__setLayerKey__ = function(filePath) {
  var name = /[^\/]*\.js$/.exec(filePath)[0].replace(/.js$/, '');

  if (this.__resourceConf__ === undefined) {
    // resourceConf was not supplied, so we create a new empty one.
    this.__resourceConf__ = {};
  }

  // if the path variable has not been set yet, let the Resolver set it when it calls this method.
  if (this.__resourceConf__.path === undefined) {
    this.__resourceConf__.path = '/' + /[^\/]*\.js$/.exec(filePath)[0].replace(/.js$/, '');
  }

  return {
    type: 'resource',
    name: name
  };
}

export default Resource;
