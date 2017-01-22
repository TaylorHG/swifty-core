import SwiftyObject from '@swift-developer/swifty-objects';

var singletonLayer = class SingletonLayer extends SwiftyObject {
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


var layerProperties = singletonLayer.__layerProperties__ = {};
layerProperties.isSingleton = true;

export default singletonLayer;
