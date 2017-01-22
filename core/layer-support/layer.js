import SwiftyObject from '@swift-developer/swifty-objects';

export default class Layer extends SwiftyObject {
  setup() {
    console.error('Setup method must be overriden!');
  }

  apply() {
    console.error('Apply method must be overriden!');
  }

  injectLayers() {
    return [];
  }
}
