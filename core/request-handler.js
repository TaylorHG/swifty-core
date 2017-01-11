export default class RequestHandler {
  constructor(resolver, handler) {
    this.resolver = resolver;
    this.handler = handler;
  }

  handleRequest(req, res) {
    // look through controllers to find one for this request.
    var controllerLayerKey = this.handler.getControllerForRequest(req);

    // setup the controller
    var controllerForRequest = this.resolver.getLayerByKey(controllerLayerKey);

    // use handler to determine correct method to handle this request
    var method = this.handler.findControllerMethod(req, controllerForRequest.constructor);

    // TODO: inject necessary layers and create a path through them for the request

    // TODO: handle the request by passing it through all injected layers

    // for now i'm just gonna go with this:
    controllerForRequest[method].apply(req, res);
  }
}
