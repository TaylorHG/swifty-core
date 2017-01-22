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
}
