import SingletonLayer from '../layer-support/singleton-layer';

var Controller = class Controller extends SingletonLayer {

  __prepareForLayerInsertion__(key) {
    if (this.__requestHandlers__ === undefined) {
      this.__requestHandlers__ = {};
    }

    if (this.__requestHandlers__[key] === undefined) {
      var requestHandler = {
        preLayers: [],
        postLayers: [],
        apply: undefined
      }
      this.__requestHandlers__[key] = requestHandler;
    }
  }

  __createRequestHandler__(key, requestHandlerDetails, method) {
    this.__prepareForLayerInsertion__(key);
    var requestHandler = this.__requestHandlers__[key];

    for (var detail in requestHandlerDetails) {
      if (requestHandlerDetails.hasOwnProperty(detail)) {
        requestHandler[detail] = requestHandlerDetails[detail];
      }
    }

    requestHandler.apply = method;
    this.__requestHandlers__[key] = requestHandler;
  }

  __prependLayerByKey__(key, layerKey) {
    this.__prepareForLayerInsertion__(key);
    this.__requestHandlers__[key].preLayers.push(layerKey);
  }

  __appendLayerByKey__(key, layerKey) {
    this.__prepareForLayerInsertion__(key);
    this.__requestHandlers__[key].postLayers.push(layerKey);
  }
}

Controller.prototype.constructor.__setLayerKey__ = function(filePath) {
  var name = /[^\/]*\.js$/.exec(filePath)[0].replace(/.js$/, '');

  if (this.__controllerConf__ === undefined) {
    // controllerConf was not supplied, so we create a new empty one.
    this.__controllerConf__ = {};
  }

  // if the path variable has not been set yet, let the Resolver set it when it calls this method.
  if (this.__controllerConf__.path === undefined) {
    this.__controllerConf__.path = '/' + /[^\/]*\.js$/.exec(filePath)[0].replace(/.js$/, '');
  }

  return {
    type: 'controller',
    name: name
  };
}

export default Controller;
