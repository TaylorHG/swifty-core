var singletonLayer = class SingletonLayer {
  setup() {
    console.error('Layer method must be overriden!');
  }
}


var layerProperties = singletonLayer.__layerProperties__ = {};
layerProperties.isSingleton = true;

export default singletonLayer;
