import { LAYER_STATES } from './layer-states';

/**
 * Container for a Layer that contains the Layer itself, as welll as some meta data
 */
export default class LayerContainer {
  constructor(layer, path) {
    // unpack the layer
    var unpackedLayer = layer.default;

    // get the layer's constructor
    var layerConstructor = unpackedLayer.prototype.constructor;

    // store layer
    this.layer = unpackedLayer;

    // store path from which layer was loaded
    this.path = path;

    // check whether the layer is a singleton
    this.isSingleton = layerConstructor.__layerProperties__.isSingleton || false;

    // if the layer is a singleton one
    if (this.isSingleton) {
      // we instantiate it
      var layerInstance = new layerConstructor();

      // and then store the instantiated layer for retrieval later by the resolver
      this.singletonLayerInstance = layerInstance;
    }

    this.layerKey = layerConstructor.__setLayerKey__(path);

    this.compactLayerKey = `${this.layerKey.type}:${this.layerKey.name}`;

    // set state of layer to RAW, this means it still requires setting up by the Resolver
    this.transitionTo(LAYER_STATES.RAW);
  }


  /**
   * set the State of this Layer to a given State
   * @param {LAYER_STATE} state to transition to
   * @returns {boolean} true if transition was successful
   */
  transitionTo(state) {
    if (state && LAYER_STATES[state.identifier]) {
      this.state = state;
      return true;
    } else {
      console.error(`Layer transitioned to Invalid state!\nState was: ${state}`);
      return false;
    }
  }

  /**
   * gets filename, set when the layer was loaded originally by the LayerLoader.
   *
   * ex. "haywyre-is-awesome.js"
   *
   * @returns {String} the filename for the layer inside this container.
   */
  getFileName() {
    return /[^\/]*\.js$/.exec(this.path)[0].replace(/.js$/, '');
  }

  /**
   * gets the layerKeys that make up the dependencies for the layer inside this LayerContainer.
   * @return {Array} array of layerKeys that make up the dependencies for the layer inside this LayerContainer.
   */
  get dependencies() {
    if (this.isSingleton) {
      // get the dependencies for the singleton layer. easy.
      return this.singletonLayerInstance.injectLayers();
    } else {
      // non-singleton layer, so we create an instance of it and check if it requires dependencies
      var probeInstance = new this.layer();
      probeInstance.define();
      return probeInstance.injectLayers();
    }
  }
}
