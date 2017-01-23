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
   * registers a Layer with this LayerStore. It can then be easily
   *   pulled out, instantiated, and manipulated.
   * @param {LayerContainer} layer to register with the Store
   * @returns {Boolean} true if the Layer was registered, otherwise returns false.
   */
  registerLayer(layerContainer) {
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
   * @param {String} layerKey to map
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
}
