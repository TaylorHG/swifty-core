import SwiftyObject from '@swift-developer/swifty-objects';

export default class Layer extends SwiftyObject {

  /**
   * Called by the RequestHandler, this is where the logic the Layer should perform should be.
   */
  define() {
    console.error('Apply method must be overriden!');
  }

  /**
   * returns an array of LayerKeys which are then injected into the Layer by the Resolver.
   */
  injectLayers() {
    return [];
  }
}
