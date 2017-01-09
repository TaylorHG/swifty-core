import fs from 'fs';
import SwiftyObject from '@swift-developer/swifty-objects';

// import resolver related modules
import LayerLoader from './layer-loader';
import LayerStore from './layer-store';

export default class Resolver extends SwiftyObject {

  /**
   * Load all layers inside the app, create a new LayerStore with those layers loaded inside.
   * @returns {Promise} promise that resolves when the Resolver itself has been fully initialized.
   */
  init() {
    // return promise to resolve all modules within the current application.
    return new Promise((resolve) => {
      var layerLoader = new LayerLoader();

      // register all layers within the current application and load them
      // into this Resolver's layerStore for instantiation later.
      layerLoader.loadLayers(`${process.cwd()}/dist/app`).then((layers) => {
        this.set('layerStore', new LayerStore);

        if (layers.length === 0) {
          console.error('No layers detected!');
        }

        // register layers
        layers.forEach((layer) => {
          this.get('layerStore').registerLayer(layer);
        });

        resolve();
      }, function() {
        console.error('Failed to load layers... :(');
      });
    })
  }

  /**
   * get a layer by its key.
   * @param {String} key used to pull the Layer out of the store.
   * @returns {Class} class corresponding to the given key.
   */
  getLayerByKey(key) {
    var keys = key.split(':');
    return this.get('layerStore').layerMap[keys[0]][keys[1]];
  }
}
