import SwiftyObject from '@swift-developer/swifty-objects';
import Layer from './layer';

var singletonLayer = class SingletonLayer extends Layer { }


var layerProperties = singletonLayer.__layerProperties__ = {};
layerProperties.isSingleton = true;

export default singletonLayer;
