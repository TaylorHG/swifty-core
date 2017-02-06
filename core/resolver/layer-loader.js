import fs from 'fs';
import pathModule from 'path';
var babel = require('babel-core');
import babelPresetSwifty from 'babel-preset-swifty';
import LayerContainer from './layer-container';
import mkpath from 'mkpath';

import { LOGGER } from '@swift-developer/swifty-logger';

export default class LayerLoader {

  constructor(rootDirectory) {
    this.rootDirectory = rootDirectory;
  }

  /**
   * load all modules under the given path
   * @param {String} to read files from
   * @returns {Promise} promise that resolves with all modules under the requested path.
   */
  loadLayers() {
    return new Promise((resolve, reject) => {

      // create dist folder if it does not exist already
      fs.mkdir(`${process.cwd()}/dist`, (err) => {

        // error code -17 is created by node when the folder already exists, so an error like this we don't care about.
        if (err && err.errno !== -17) {
          reject(err);
        }

        // delete the old applicaiton inside the dist folder if it exists
        var deleteFolderRecursive = function(path) {
          if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file,index){
              var curPath = path + "/" + file;
              if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
              } else { // delete file
                fs.unlinkSync(curPath);
              }
            });
            fs.rmdirSync(path);
          }
        };
        deleteFolderRecursive(`${process.cwd()}/dist/app`);

        // repeat the same process for the app folder inside the dist folder, which is where we will store the compiled application
        fs.mkdir(`${process.cwd()}/dist/app`, (err) => {
          if (err && err.errno !== -17) {
            reject(err);
          }

          // compile all the resources in the directory
          return this.loadLayersInPath(this.rootDirectory).then(() => {
            resolve(this.layers);
          }).catch(function(err) {
            reject(err);
          });
        });
      });
    });
  }

  /**
   * load all modules in the path
   * @param {String} path to read files from
   * @returns {Promise} promise that resolves with all modules under the requested path.
   */
  loadLayersInPath(path) {
    var _this = this;
    this.layers = [];

    return new Promise(function(resolve, reject) {
      // load layers recursively
      fs.lstat(path, function(err, stat) {
        if (stat === undefined) {
          reject(err);
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
              fileLoadPromises.push(_this.loadLayersInPath(f));
            }
            // wait until all files in this directory have been resolved, then resolve this function as well.
            Promise.all(fileLoadPromises).then(function() {
              resolve(_this.layers);
            }).catch(err => {
              reject(err);
            });
          })
        } else {
          // only require js files.
          if (pathModule.extname(path) === ".js") {
            // we have a javascript file: compile it, load it and then add it to this layer loader.
            _this.loadRawLayer(path).then(function(layerContainer) {
              if (layerContainer) {
                _this.layers.push(layerContainer);
              }
              resolve(layerContainer);
            }).catch(function(err) {
              reject(err);
            });
          } else {
            // no files to load here;
            resolve();
          }
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
        LOGGER.error(`Module (found in ${filePath}) was not exported as default, therefore it will not be handled by the Resolver.`);
        return false;
    }

    if (layer.default.prototype.constructor.__layerProperties__ === undefined) {
      LOGGER.error(`Layer located at: ${filePath} was missing layerProperties. It was either an invalid Layer, or the file was loaded by the resolver by accident.`);
      return false;
    }

    if (layer.default.prototype.constructor.__setLayerKey__ === undefined) {
      LOGGER.error(`Layer located at: ${filePath} was missing function to define layerKey. It was either an invalid Layer, or the file was loaded by the resolver by accident.`);
      return false;
    }

    return new LayerContainer(layer, filePath);
  }

  /**
   * Load a raw babel-script file that contains a layer.
   * @param {String} the name of the file to load.
   * @returns {Promise} resolves with a LayerContainer that holds the layer to load. Rejects on error.
   */
  loadRawLayer(fileName) {
    return new Promise((resolve, reject) => {
      // use babel to transform the file using the babel-preset-swifty preset.
      babel.transformFile(fileName, {
         presets: [babelPresetSwifty]
      }, (err, result) => {
        if (err) {
          reject(err);
        } else {

          // upon successful compilation, write the file to the dist directory.
          var regex = new RegExp("^" + `${process.cwd()}/${this.rootDirectory}`);
          var projectPath = fileName.replace(new RegExp(`${process.cwd()}`), '');
          var appPath = projectPath.replace(/^\/[^\/]+/, '');
          var outputFilePath = `${process.cwd()}/dist/app${appPath}`;
          var outputFileDirectory = outputFilePath.replace(/\/[^\/]*$/, '');

          // create path to files we need to write
          mkpath(outputFileDirectory, (err) => {
            if (err) {
              reject(err);
            };

            // write the compiled file
            fs.writeFile(outputFilePath, result.code, (err) => {
              if (err) {
                reject(err);
              } else {

                // after successfully writing the file, require it as a LayerContainer and resolve the promise with it.
                resolve(this.loadLayer(outputFilePath));
              }
            });
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
