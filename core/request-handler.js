import RequestSession from './request-session';

export default class RequestHandler {
  constructor(resolver, handler) {
    this.resolver = resolver;
    this.handler = handler;
  }

  handleRequest(req, res) {
    var requestSession = new RequestSession(req, res);

    // look through controllers to find one for this request.
    var controllerLayerKey = this.handler.getControllerForRequest(req);

    // setup the controller
    var controllerForRequest = this.resolver.getLayerByKey(controllerLayerKey);

    // use handler to determine correct method to handle this request
    var controllerHandlerName = this.handler.findControllerMethod(req, controllerForRequest.constructor);
    var handlerForRequest = controllerForRequest.__requestHandlers__[controllerHandlerName];

    // delegate request to prepended layers
    for (let layerName in handlerForRequest.preLayers) {
      var preLayer = this.resolver.getLayerByKey(layerName);
      console.log(`Ran layer: ${layerName}`);
    }

    // delegate request to controller method then store result in request session
    requestSession.controllerResult = handlerForRequest.apply(req, res);
    console.log(`Ran controller: ${layerName}`);

    // delegate request to appended layers
    handlerForRequest.postLayers.forEach((layerName) => {
      var postLayer = this.resolver.getLayerByKey(layerName);
      console.log(`Ran layer: ${layerName}`);
      // if the layer is a finalLayer, we set the result for the request as it's result.
      if (postLayer.constructor.__layerProperties__.isFinal) {
        requestSession.setResult(postLayer.apply(requestSession));
      }
    });

    // end the request session, triggering the response to be sent to the client.
    requestSession.end();
  }
}
