import fs from 'fs';
import SwiftyObject from '@swift-developer/swifty-objects';

// import resolver related modules
import LayerLoader from './layer-loader';
import LayerStore from './layer-store';
import { LAYER_STATES } from './layer-states';

export default class Resolver extends SwiftyObject {
  constructor() {
    super();
    this.set('layerStore', new LayerStore());
  }


  /**
   * Load all layers inside the app, create a new LayerStore with those layers loaded inside. This method is typically only called when the application is starting up.
   * @returns {Promise} promise that resolves when the Resolver itself has been fully initialized.
   */
  init() {
    // return promise to resolve all modules within the current application.
    return new Promise((resolve) => {
      var layerLoader = new LayerLoader();

      // register all layers within the current application and load them
      // into this Resolver's layerStore for instantiation later.
      layerLoader.loadLayers(`${process.cwd()}/dist`).then((layers) => {
        if (layers.length === 0) {
          console.error('No layers detected!');
        }

        // register layers with layerStore
        layers.forEach((layerContainer) => {
          this.get('layerStore').loadRawLayer(layerContainer);
        });

        // define the singleton layers
        layers.forEach((layerContainer) => {
          if (layerContainer.isSingleton) {
            layerContainer.singletonLayerInstance.define();
            layerContainer.transitionTo(LAYER_STATES.DEFINED);
          }
        })

        // map dependencies of the LayerStore
        this.get('layerStore').mapDependencies();

        // inject dependencies for each layer
        this.get('layerStore').injectIntoSingletonLayers();

        // mark all layers as ready
        layers.forEach((layerContainer) => {
          layerContainer.transitionTo(LAYER_STATES.READY);
        });

        resolve();
      }, function() {
        console.error('Failed to load layers... :(');
      });
    })
  }

  /**
   * Register the layer with this resolver.
   * This allows the Resolver to inspect the Layer and insure it is properly initialized before loading it into its store.
   * @param {LayerContainer} layerContainer that should be loaded into the store.
   * @returns {boolean} Whether the layer was successfully loaded or not.
   */
  registerLayer(layerContainer) {
    this.get('layerStore').registerLayer(layerContainer);
    return true;
  }

  /**
  * Deregister the layer with this resolver.
  * @param {LayerContainer} layerContainer that should be removed from the store.
  * @returns {boolean} Whether the layer was successfully removed or not.
   */
  deregisterLayer(layerContainer) {
    this.get('layerStore').deregisterLayer(layerContainer);
    return true;
  }

  /**
   * Use the FileLoader to load in a layer by filename. File must have been written in ES7 (swifty).
   * If the Layer already exists inside the store, it will replace what it currently has with the new Layer.
   * @param {String} fileName of file to load.
   * @returns {Promise} that resolves with the loaded Layer.
   */
  addLayerByFileName(fileName) {
    return new Promise((resolve, reject) => {
      new LayerLoader().loadRawLayer(fileName).then((layerContainer) => {
        this.registerLayer(layerContainer);
        resolve(layerContainer);
      }, reject);
    });
  }

  /**
   * Use the FileLoader to remove a layer by filename. File must have been written in ES7 (swifty).
   * If the Layer already exists inside the store, it will delete that Layer from the store.
   * @param {String} fileName of the file to remove
   * @returns {Promise} that resolves with the removed Layer.
   */
  removeLayerByFileName(fileName) {
    // get compiled version of the file as the raw babel-script and uncompiled version might no longer exist (it could have been deleted).
    var regex = new RegExp("^" + `${process.cwd()}/app`);
    var fileNameToRemove = `${process.cwd()}/dist${fileName.replace(regex, '')}`;
    return new Promise((resolve, reject) => {
      var layerLoader = new LayerLoader()
      var layerContainer = layerLoader.loadLayer(fileNameToRemove);
      if (layerContainer) {
        layerLoader.unlinkLayer(fileNameToRemove).then(() => {
          if (this.deregisterLayer(layerContainer)) {
            resolve(layerContainer);
          } else {
            reject(new Error(`${layerContainer.type}:${layerContainer.name} failed to be deregisted.`))
          }
        }, reject);
      } else {
        reject();
      }
    });
  }

  /**
   * get a layer by its key.
   * @param {String} key used to pull the Layer out of the store.
   * @returns {Class} class corresponding to the given key.
   */
  getLayerByKey(key) {
    var layerContainer = this.getLayerContainerByKey(key);
    if (layerContainer === undefined) {
      return undefined;
    }
    if (layerContainer.isSingleton) {
      return layerContainer.singletonLayerInstance;
    } else {
      return new layerContainer.layer();
    }
  }

  /**
   * get a layer container by key
   * @param {String} key used to the pull the LayerContainer out of the store
   * @returns {LayerContainer} LayerContainer to pull from the store
   */
   getLayerContainerByKey(key) {
     return this.get('layerStore').getByKey(key);
   }
}
