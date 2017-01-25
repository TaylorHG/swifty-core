import { LAYER_STATES } from './layer-states';

class DependencyTreeNode {
  constructor(layerKey) {
    this.layerKey = layerKey;
    this.dependencies = [];
  }
}

class DependencyTreeRoot extends DependencyTreeNode {
  constructor(layerKey, dependencies) {
    super(layerKey);
    dependencies.forEach((dependency) => {
      this.dependencies.push(new DependencyTreeNode(dependency));
    })
  }

  getNodesByLayerKey(layerKey) {
    var nodes = [];
    var reapNodes;

    var reapDependencyNodes = function(dependencies) {
      // check its depenedencies
      if (dependencies.length) {
        dependencies.forEach(function(dependencyNode) {
          reapNodes(dependencyNode);
        });
      }
    }

    var reapNodes = function(node) {
      // check if node is a Node we are looking for
      if (node.layerKey === layerKey) {
        nodes.push(node);
      }
      reapDependencyNodes(node.dependencies);
    }

    // make call to recursively check the dependencies inside this tree for nodes with keys by that name
    reapDependencyNodes(this.dependencies);

    return nodes;
  }

  findNodesDependingOn(dependencyKey) {
    var nodesWithDependency = [];
    var reapNodes;

    var checkDependencies = function(node) {
      if (node.dependencies.length) {
        // check its depenedencies for presence of the dependency we are looking for
        node.dependencies.forEach(function(dependencyNode) {
          if (dependencyNode.layerKey === dependencyKey) {
            // node depends on the dependency we were checking, so we add it to the nodesWithDependency
            nodesWithDependency.push(node.layerKey)
          }
          checkDependencies(dependencyNode);
        });
      }
    }

    // make call to recursively check this node for dependent layers
    checkDependencies(this);

    return nodesWithDependency;
  }
}

/**
 * Store to hold raw Layer prototypes that have been loaded by the Resolver.
 * The Store's job is to insure that Layers are always ready to be pulled out by the Resolver.
 * It does this by mapping dependencies and setting up Layers if they need it.
 */
export default class LayerStore {
  constructor() {
    this.layerMap = {};
    this.dependencyTrees = {};
  }

  /**
   * get a layer container by key
   * @param {String} key used to the pull the LayerContainer out of the store
   * @returns {LayerContainer} LayerContainer to pull from the store
   */
  getByKey(key) {
    var keys = key.split(':');
    return this.layerMap[keys[0]][keys[1]];
  }


  /**
   * get a layer instance by key
   * @param {String} key used to the pull the LayerContainer out of the store
   * @returns {LayerContainer} LayerContainer to pull from the store
   */
  getInstanceByKey(key) {
    var layerContainer = this.getByKey(key);
    if (layerContainer.isSingleton) {
      return layerContainer.singletonLayerInstance;
    } else {
      var layerInstance = new layerContainer.layer();
      return layerInstance;
    }
  }

  /**
   * registers a raw Layer with this LayerStore
   * @param {LayerContainer} layer to register with the Store
   * @returns {Boolean} true if the Layer was registered, otherwise returns false.
   */
  loadRawLayer(layerContainer) {
    var layerKey = layerContainer.layerKey;
    var layerConstructor = layerContainer.layer.prototype.constructor;
    if (this.layerMap[layerKey.type]) {
      // delete the old layer if it's there and replace it with the new
      delete this.layerMap[layerKey.type][layerKey.name];
      this.layerMap[layerKey.type][layerKey.name] = layerContainer;
    } else {
      // add the new layer type,
      this.layerMap[layerKey.type] = {};
      this.layerMap[layerKey.type][layerKey.name] = layerContainer;
    }

    return true;
  }

  /**
   * registers a Layer with this LayerStore. It can then be easily
   *   pulled out, instantiated, and manipulated.
   * @param {LayerContainer} layer to register with the Store
   * @returns {Boolean} true if the Layer was registered, otherwise returns false.
   */
  registerLayer(layerContainer) {
    // re-inject the layer into the layer store.
    this.loadRawLayer(layerContainer);

    // define the layer if it is a singleton in order to remap its dependencies if they exist
    if (layerContainer.isSingleton) {
      layerContainer.singletonLayerInstance.define();
    }

    // (re)map dependencies
    this.mapDependencies();

    // (re)inject dependencies
    this.injectIntoSingletonLayers();

    // set the layer to READY state
    layerContainer.transitionTo(LAYER_STATES.READY);
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

  /**
   * map dependencies inside the layerStore, this initializes the dependencyTrees of the Store.
   */
  mapDependencies() {
    // create dependency trees for each Layer in the store
    for (let layerType in this.layerMap) {
      if (this.layerMap.hasOwnProperty(layerType)) {
        for (let layerName in this.layerMap[layerType]) {
          if (this.layerMap[layerType].hasOwnProperty(layerName)) {
            var layerKeyToMap = `${layerType}:${layerName}`;
            this.dependencyTrees[layerKeyToMap] = new DependencyTreeRoot(layerKeyToMap, this.layerMap[layerType][layerName].dependencies);
          }
        }
      }
    }
    // iterate through each of the trees, merging them into one another where applicable
    for (let mergeTreeKey in this.dependencyTrees) {
      if (this.dependencyTrees.hasOwnProperty(mergeTreeKey)) {
        var layerKeyToMerge = `${mergeTreeKey.layerKey}`;
        // look through the other trees for nodes that represent the tree we are merging
        for (let receivingTreeKey in this.dependencyTrees) {
          if (this.dependencyTrees.hasOwnProperty(receivingTreeKey)) {
            if (mergeTreeKey === receivingTreeKey) {
              continue; // skip this tree if it is the one we are trying to merge
            }
            // get all the nodes that this tree can merge with
            var nodesToMerge = this.dependencyTrees[receivingTreeKey].getNodesByLayerKey(this.dependencyTrees[mergeTreeKey].layerKey);
            nodesToMerge.forEach((nodeToMerge) => {
              this.getByKey(receivingTreeKey).transitionTo(LAYER_STATES.MAPPED);
              nodeToMerge.dependencies = this.dependencyTrees[mergeTreeKey].dependencies;
            });
          }
        }
      }
    }
  }

  /**
   * Inject depenedencies into all Singleton Layers.
   */
  injectIntoSingletonLayers() {
    for (let layerType in this.layerMap) {
      if (this.layerMap.hasOwnProperty(layerType)) {
        for (let layerName in this.layerMap[layerType]) {
          if (this.layerMap[layerType].hasOwnProperty(layerName)) {
            var layerToInjectInto = this.getByKey(`${layerType}:${layerName}`);
            if (layerToInjectInto.isSingleton) {
              if (layerToInjectInto.dependencies.length > 0) {
                this.injectIntoSingletonLayer(`${layerType}:${layerName}`);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Inject depenedencies into a SingletonLayer.
   * @param {String} key of layer to inject dependencies into.
   */
  injectIntoSingletonLayer(key) {
    var layerContainer = this.getByKey(key);
    var layersToInject = layerContainer.singletonLayerInstance.injectLayers();
    layersToInject.forEach((layerName) => {
      var layerToInject = this.getByKey(layerName);
      if (layerToInject.isSingleton) {
        layerContainer.singletonLayerInstance.set(layerName, layerToInject.singletonLayerInstance);
      }
    });
    layerContainer.transitionTo(LAYER_STATES.INJECTED);
  }

  /**
   * get dependencies for Layers by Layer Key
   * @param {String} key of the layer to fetch dependencies for
   * @returns {Array} Array of compact layer keys
   */
  getDependentLayers(key) {
    var dependentLayers = [];
    for (let treeToCheck in this.dependencyTrees) {
      if (this.dependencyTrees.hasOwnProperty(treeToCheck)) {
        this.dependencyTrees[treeToCheck].findNodesDependingOn(key).forEach(function(compactLayerKey) {
          dependentLayers.push(compactLayerKey);
        });
      }
    }
    return dependentLayers;
  }
}
