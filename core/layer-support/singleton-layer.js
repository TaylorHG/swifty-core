var singletonLayer = class SingletonLayer {
  setup() {
    console.error('Setup method must be overriden!');
  }

  apply() {
    console.error('Apply method must be overriden!');
  }
}


var layerProperties = singletonLayer.__layerProperties__ = {};
layerProperties.isSingleton = true;

export default singletonLayer;
