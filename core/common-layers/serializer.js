import SingletonLayer from '../layer-support/singleton-layer'
import incase from 'incase';

class ObjectSerializer {
  serializeString(string) {
    // insure the field shows up as a string in the response, otherwise cast it to one.
    return string.toString();
  }

  serializeNumber(number) {
    // insure the field that shows up is a number, otherwise cast it to one.
    return Number(number);
  }
}

class SerializationEngine {
  constructor(serializerSchema) {
    this.serializerSchema = serializerSchema;
    this.valueSerializer = new ObjectSerializer();
  }

  createSerializableObject(rawObject) {
    var serializableObject = {};

    for (let property in this.serializerSchema) {
      if (this.serializerSchema.hasOwnProperty(property)) {
        var valueType = this.serializerSchema[property].type;
        // get the function for serializing this type of property.
        var serializeProperty = this.valueSerializer[`serialize${incase.classCase(valueType)}`];
        // use the function to serialize the property.
        var serializedPropertyValue = serializeProperty(rawObject[property]);
        // store the property inside the object that will be serialized.
        serializableObject[incase.snakeCase(property)] = serializedPropertyValue;
      }
    }

    return serializableObject;
  }

  serializeArray(rawArrayToSerialize) {
    var arrayToSerialize = [];
    var serializer = new this.serializerSchema.serializer();
    serializer.setup();
    var engine = new SerializationEngine(serializer.serializerSchema);
    rawArrayToSerialize.forEach(function(object) {
      arrayToSerialize.push(engine.createSerializableObject(object));
    });
    return JSON.stringify(arrayToSerialize);
  }

  serializeObject(objectToSerialize) {
    var serializableObject = this.createSerializableObject(objectToSerialize);
    return JSON.stringify(serializableObject);
  }
}


var Serializer = class Serializer extends SingletonLayer {
  constructor() {
    super();
    this.serializerSchema = {};
  }

  setup() {
    this.define();
  }

  attr(attribute, type, options) {
    this.serializerSchema[attribute] = {
      type: type,
      options: options
    };
  }

  array(serializer) {
    this.isArraySerializer = true;
    this.serializerSchema = {
      serializer: serializer
    };
  }

  apply(session) {
    var engine = new SerializationEngine(this.serializerSchema);
    if (this.isArraySerializer) {
      return engine.serializeArray(session.controllerResult);
    } else {
      return engine.serializeObject(session.controllerResult);
    }
  }
}

Serializer.prototype.constructor.__setLayerKey__ = function(filePath) {
  var name = /[^\/]*\.js$/.exec(filePath)[0].replace(/.js$/, '');

  // if the path variable has not been set yet, let the Resolver set it when it calls this method.
  if (this.__serializerConf__) {
    if (this.__serializerConf__.path === undefined) {
      this.__serializerConf__.path = '/' + /[^\/]*\.js$/.exec(filePath)[0].replace(/.js$/, '');
    }
  }

  return {
    type: 'serializer',
    name: name
  };
}

Serializer.__layerProperties__.isFinal = true;

export default Serializer;
