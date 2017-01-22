import fs from 'fs';
import SwiftyObject from '@swift-developer/swifty-objects';

// import resolver related modules
import LayerLoader from './layer-loader';
import LayerStore from './layer-store';

export default class Resolver extends SwiftyObject {

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
        this.set('layerStore', new LayerStore);

        if (layers.length === 0) {
          console.error('No layers detected!');
        }

        // register layers with layerStore
        layers.forEach((layerContainer) => {
          this.get('layerStore').registerLayer(layerContainer);
        });

        // after layers have been registered with LayerStore,
        // instantiate singletons and handle dependency injections
        layers.forEach((layerContainer) => {
          this.registerLayer(layerContainer);
        });

        resolve();
      }, function() {
        console.error('Failed to load layers... :(');
      });
    })
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
   * Register the layer with this resolver. This allows the Resolver to inspect the Layer and insure it is properly setup before loading it into its store.
   * @param {LayerContainer} layerContainer that should be loaded into the store.
   * @returns {boolean} Whether the layer was successfully loaded or not.
   */
  registerLayer(layerContainer) {
    // inspect the layer for any necessary injections
    if (layerContainer.isSingleton) {
      layerContainer.singletonLayerInstance.setup();
      var layersToInject = layerContainer.singletonLayerInstance.injectLayers();
      // TODO make requiring a singleton Layer is possible. and handle circular dependencies when injecting.
      //  For instance, if my serializer:swag requires my serializer:swags, insure it is loaded if it is a singleton, but also
      //  insure that it does not require itself, or chain.
      layersToInject.forEach((layerName) => {
        layerContainer.singletonLayerInstance.set(layerName, this.getLayerByKey(layerName));
      });
    }

    this.get('layerStore').registerLayer(layerContainer);
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
          if (this.get('layerStore').deregisterLayer(layerContainer)) {
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
    var keys = key.split(':');
    var layerContainer = this.get('layerStore').layerMap[keys[0]][keys[1]];
    if (layerContainer === undefined) {
      return undefined;
    }
    if (layerContainer.isSingleton) {
      return layerContainer.singletonLayerInstance;
    } else {
      return layerContainer.layer;
    }
  }
}
