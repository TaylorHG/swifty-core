import fs from 'fs';
import pathModule from 'path';
var babel = require('babel-core');
import babelPresetSwifty from 'babel-preset-swifty';
import LayerContainer from './layer-container';

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
        if (stat === undefined) {
          console.error(path);
        }
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
          // only require js files.
          if (pathModule.extname(path) === ".js") {
            // we have a javascript file: load it and add it to this layer loader.
            _this.layers.push(_this.loadLayer(path));
          }

          resolve();
        }
      });
    });
  }

  /**
   * Load a Layer by file name from a file path. Ignores Node.js caching.
   * @param {String} file path to the file needed to be loaded
   * @returns {LayerContainer} LayerContainer containing the requested file after it has been required.
   */
  loadLayer(filePath) {
    // if node.js cached the file, remove the cached version
    if (require.cache[filePath]) {
      delete require.cache[filePath]
    }

    var layer = require(filePath);

    if (layer.default === undefined) {
        console.error(`Module (found in ${filePath}) was not exported as default, therefore it will not be handled by the Resolver.`);
        return false;
    }

    if (layer.default.prototype.constructor.__layerProperties__ === undefined) {
      console.error(`Layer located at: ${filePath} was missing layerProperties. It was either an invalid Layer, or the file was loaded by the resolver by accident.`);
      return false;
    }

    return new LayerContainer(layer, filePath);
  }

  /**
   * Load a raw babel-script file that contains a layer.
   * @param {String} the name of the file to load.
   * @returns {LayerContainer} container that holds the layer to load.
   */
  loadRawLayer(fileName) {
    var _this = this;
    return new Promise(function(resolve, reject) {
      // use babel to transform the file using the babel-preset-swifty preset.
      babel.transformFile(fileName, {
         presets: [babelPresetSwifty]
      }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          // upon successful compilation, write the file to the dist directory.
          var regex = new RegExp("^" + `${process.cwd()}/app`);
          var outputFilePath = `${process.cwd()}/dist${fileName.replace(regex, '')}`;
          fs.writeFile(outputFilePath, result.code, function(err) {
            if (err) {
              reject(err);
            }

            // after successfully writing the file, require it as a LayerContainer and resolve the promise with it.
            resolve(_this.loadLayer(outputFilePath));
          });
        }
      });
    });
  }

  /**
   * Removes a file from the compiled directory.
   * @param {String} the name of the file to delete.
   * @returns {Promise} promise to delete the file.
   */
  unlinkLayer(fileName) {
    return new Promise(function(resolve, reject) {
      fs.unlink(fileName, function(err) {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }
}
