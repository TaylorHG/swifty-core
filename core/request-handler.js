import ResourceNotFound from './routing/errors/resource-not-found';
import RequestSession from './request-session';

export default class RequestHandler {
  constructor(resolver, handler) {
    this.resolver = resolver;
    this.handler = handler;
  }

  handleRequest(req, res) {
    var router = this.resolver.getLayerByKey('core:router');

    var requestSession = new RequestSession(req, res);

    // get resource path for request
    var resourcePath = router.getResourcePathForRequest(req);

    // run the request through each resource path
    resourcePath.forEach((routingNode) => {

      // get an instance of the resource to use for the request
      var resourceForRequest = this.resolver.getLayerByKey(`resource:${routingNode.blueprint.options.resource}`);

      if (resourceForRequest === undefined) {
        throw new ResourceNotFound(`resource:${routingNode.blueprint.options.resource} was not found, but should exist according to the route for ${req.url}.`);
      }

      // use handler to determine the function on the resource to use to fulfill the request
      var resourceHandlerName = this.handler.findFunctionForRequest(req, resourceForRequest, resourcePath);

      // get that function
      var handlerForRequest = resourceForRequest.__requestHandlers__[resourceHandlerName];

      // delegate request to prepended layers
      for (let ndx in handlerForRequest.preLayers) {
        var layerName = handlerForRequest.postLayers[ndx];
        var preLayer = this.resolver.getLayerByKey(layerName);
        preLayer.apply(requestSession);
      }

      // delegate request to resource function then store result in request session
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
    });

    // end the request session, triggering the response to be sent to the client.
    requestSession.end();
  }
}
