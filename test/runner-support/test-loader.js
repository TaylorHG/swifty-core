import fs from 'fs';
import pathModule from 'path';

class TestContainer {
  constructor(filename, testModule, testSubject) {
    this._filename = filename;
    this._testModule = testModule;
    this._testSubject = testSubject;
  }

  get filename() {
    return this._filename;
  }

  get testModule() {
    return this._testModule;
  }

  get testSubject() {
    return this._testSubject;
  }
}

export default class TestLoader {

  constructor() {
    this.loadedTestContainers = [];
    this.supportFiles = [];
  }

  get testContainers() {
    return this.loadedTestContainers;
  }

  loadFiles(path) {
    return new Promise((resolve, reject) => {
      // load tests recursively
      fs.lstat(path, (err, stat) => {
        if (stat === undefined) {
          console.error(path);
        }
        if (stat.isDirectory()) {
          // create promise to load a file for each file inside this directory.
          var fileLoadPromises = []

          // we have a directory: do a tree walk to load the tests within
          fs.readdir(path, (err, files) => {
            var f, l = files.length;

            // start loading files asynchronously
            for (var i = 0; i < l; i++) {
              f = pathModule.join(path, files[i]);
              fileLoadPromises.push(this.loadFiles(f));
            }
            // wait until all files in this directory have been resolved, then resolve this function as well.
            Promise.all(fileLoadPromises).then(() => {
              resolve(this.testContainers);
            });
          })
        } else {
          // only require js files.
          if (pathModule.extname(path) === ".js") {
            // loading a test file
            if (/-test.js$/i.test(pathModule.basename(path))) {
              // we have a javascript file: load it and add it to this layer loader.
              var file = this.loadFile(path);
              if (file.default) {
                if (file) {
                  if (file.testSubject === undefined) {
                    reject(new Error(`Test file located at: ${path} did not export a testSubject!`))
                  };
                  this.testContainers.push(new TestContainer(path, file.default, file.testSubject));
                }
              } else {
                reject(new Error(`Test file located at: ${path} was not exported by default! Therefore, it will be ignored.`));
              }
            }
          }

          resolve();
        }
      });
    });
  }


  /**
   * Load a file by file name from a file path. Ignores Node.js caching.
   * @param {String} file path to the file needed to be loaded
   * @returns {Module} loaded file.
   */
  loadFile(filePath) {
    // if node.js cached the file, remove the cached version
    if (require.cache[filePath]) {
      delete require.cache[filePath]
    }

    var file = require(filePath);

    return file;
  }

}
