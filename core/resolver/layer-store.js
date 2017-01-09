/**
 * Store to hold raw Layer prototypes that have been loaded by the Resolver.
 */
export default class LayerStore {
  constructor() {
    this.layerMap = {};
  }

  /**
   * registers a Layer with this LayerStore. It can then be easily
   *   pulled out, instantiated, and manipulated.
   * @param {LayerContainer} layer to register with the Store
   * @returns {Boolean} true if the Layer was registered, otherwise returns false.
   */
  registerLayer(layerContainer) {
    var unpackedLayer = layerContainer.layer.default;

    if (unpackedLayer === undefined) {
        console.error(`Module ${layerContainer.getFileName()} (found in ${layerContainer.path}) was not exported as default, therefore it will not be handled by the Resolver.`);
        return false;
    }

    var layerConstructor = unpackedLayer.prototype.constructor;

    var layerKey = layerConstructor.__setLayerKey__(layerContainer.path);

    if (this.layerMap[layerKey.type]) {
      this.layerMap[layerKey.type][layerKey.name] = layerConstructor;
    } else {
      this.layerMap[layerKey.type] = {};
      this.layerMap[layerKey.type][layerKey.name] = layerConstructor;
    }
  }
}
