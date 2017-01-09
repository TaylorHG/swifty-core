import fs from 'fs';
import pathModule from 'path';

export default class LayerLoader {

  /**
   * load all modules under the given path
   * @param {String} to read files from
   * @returns {Promise} promise that resolves with all modules under the requested path.
   */
  loadLayers(path) {
    var _this = this;
    this.layers = [];

    return new Promise(function(resolve) {
      // load layers recursively
      fs.lstat(path, function(err, stat) {
        if (stat.isDirectory()) {
          // create promise to load a file for each file inside this directory.
          var fileLoadPromises = []

          // we have a directory: do a tree walk to load the layers within
          fs.readdir(path, function(err, files) {
            var f, l = files.length;

            // start loading files asynchronously
            for (var i = 0; i < l; i++) {
              f = pathModule.join(path, files[i]);
              fileLoadPromises.push(_this.loadLayers(f));
            }

            // wait until all files in this directory have been resolved, then resolve this function as well.
            Promise.all(fileLoadPromises).then(function() {
              resolve(_this.layers);
            });
          })
        } else {
          // we have a file: load it and add it to this layer loader.
          var layer = new LayerContainer(require(path), path);
          _this.layers.push(layer);
          resolve();
        }
      });
    });
  }
}

/**
 * Container for a Layer that contains the Layer itself, as welll as some meta data
 */
export class LayerContainer {
  constructor(layer, path) {
    this.layer = layer;
    this.path = path;
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
