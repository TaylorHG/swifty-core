import RequestSession from './request-session';

export default class RequestHandler {
  constructor(resolver, handler) {
    this.resolver = resolver;
    this.handler = handler;
  }

  handleRequest(req, res) {
    var requestSession = new RequestSession(req, res);

    // look through resources to find one for this request.
    var resourceLayerKey = this.handler.getResourceForRequest(req);

    // setup the resource
    var resourceForRequest = this.resolver.getLayerByKey(resourceLayerKey);

    // use handler to determine correct method to handle this request
    var resourceHandlerName = this.handler.findResourceMethod(req, resourceForRequest.constructor);
    var handlerForRequest = resourceForRequest.__requestHandlers__[resourceHandlerName];

    // delegate request to prepended layers
    for (let ndx in handlerForRequest.preLayers) {
      var layerName = handlerForRequest.postLayers[ndx];
      var preLayer = this.resolver.getLayerByKey(layerName);
      preLayer.apply(requestSession);
    }

    // delegate request to resource method then store result in request session
    requestSession.resourceResult = handlerForRequest.apply(req, res);

    // delegate request to appended layers
    for (let ndx in handlerForRequest.postLayers) {
      var layerName = handlerForRequest.postLayers[ndx];
      var postLayer = this.resolver.getLayerByKey(layerName);
      // if the layer is a finalLayer, we set the result for the request as it's result.
      if (postLayer.constructor.__layerProperties__.isFinal) {
        requestSession.setResult(postLayer.apply(requestSession));
      } else {
        postLayer.apply(requestSession);
      }
    }

    // end the request session, triggering the response to be sent to the client.
    requestSession.end();
  }
}
