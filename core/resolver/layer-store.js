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
    var layerKey = layerContainer.layerKey;
    var layerConstructor = layerContainer.layer.default.prototype.constructor;
    if (this.layerMap[layerKey.type]) {
      // delete the old layer if it's there and replace it with the new
      delete this.layerMap[layerKey.type][layerKey.name];
      this.layerMap[layerKey.type][layerKey.name] = layerConstructor;
    } else {
      // add the new layer type,
      this.layerMap[layerKey.type] = {};
      this.layerMap[layerKey.type][layerKey.name] = layerConstructor;
    }

    return true;
  }

  /**
   * deregisters a Layer with this LayerStore. Making it impossible to retrieve.
   * @param {LayerContainer} layer to deregister with the Store
   * @returns {Boolean} true if the Layer was deregistered, otherwise returns false.
   */
  deregisterLayer(layerContainer) {
    var layerKey = layerContainer.layerKey;

    if (this.layerMap[layerKey.type] === undefined) {
      // layer never existed to begin with.
      return false;
    }

    if (this.layerMap[layerKey.type][layerKey.name] === undefined) {
      // layer never existed to begin with
      return false
    }

    // delete the old layer if it's there and replace it with the new
    delete this.layerMap[layerKey.type][layerKey.name];
    return true;
  }
}
