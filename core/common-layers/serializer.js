import SingletonLayer from '../layer-support/singleton-layer'
import incase from 'incase';

/**
 * Used to insure that fields show up when serialized with the same Object type that the
 * Serializer defined, and Serializer's author expects.
 */
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

/**
 * The SerializationEngine handles the actual serialization of Objects for the Serializer.
 * It is responsible for taking in the specs set by the Serializer and using them to create valid JSON.
 */
class SerializationEngine {
  constructor(serializerSchema, nestedSerializer) {
    this.serializerSchema = serializerSchema;
    this.valueSerializer = new ObjectSerializer();
    this.nestedSerializer = nestedSerializer;
  }

  /**
   * creates an Object that can be easily and cleanly serialized.
   * This object is created using this SerializationEngine's serializerSchema,
   * which is created and set by the Serializer itself, based on the class overriding it.
   */
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

  /**
   * serializes an Array or serializable objects that have been defined by another Serializer.
   */
  serializeArray(rawArrayToSerialize) {
    var arrayToSerialize = [];
    var serializer = this.nestedSerializer;
    var engine = new SerializationEngine(serializer.serializerSchema);
    rawArrayToSerialize.forEach(function(object) {
      arrayToSerialize.push(engine.createSerializableObject(object));
    });
    return JSON.stringify(arrayToSerialize);
  }

  /**
   * Serialize an Object using this SerializationEngine's serializerSchema,
   * which is created and set by the Serializer itself, based on the class overriding it.
   */
  serializeObject(objectToSerialize) {
    var serializableObject = this.createSerializableObject(objectToSerialize);
    return JSON.stringify(serializableObject);
  }
}

/**
 * Serializer can be extended by the application author to define how results from the Controller should be serialized.
 * It uses a seperate class known as a SerializationEngine to do the actual work, this class mostly exists to provide
 * a clean interface to define how the results should be serialized.
 */
var Serializer = class Serializer extends SingletonLayer {
  constructor() {
    super();
    this.serializerSchema = {};
  }

  setup() {
    this.define();
  }

  injectLayers() {
    if (this.isArraySerializer) {
      return [this.serializerSchema.serializer];
    } else {
      return [];
    }
  }

  apply(session) {
    session.res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (this.isArraySerializer) {
      var engine = new SerializationEngine(this.serializerSchema, this.get(this.serializerSchema.serializer));
      return engine.serializeArray(session.controllerResult);
    } else {
      var engine = new SerializationEngine(this.serializerSchema);
      return engine.serializeObject(session.controllerResult);
    }
  }

  /**
   * define an attribute on whatever object is passed to the serializer.
   * That attribute will be copied to the serialized result.
   * @param {String} the name of the attribute to serialize.
   * @param {String} the type of attribute to serialize.
   * @param {Object} extra options to be used when serializing this record.
   */
  attr(attribute, type, options) {
    this.serializerSchema[attribute] = {
      type: type,
      options: options
    };
  }

  /**
   * transform this serializer into an array serializer. All previous definitions will be overriden in its current implementation.
   * TODO: Make this better no longer override other `attr` definitions, and allow for sideloading.
   * @param {String} LayerKey of the serializer to use to serialize objects within the array.
   */
  array(serializer) {
    this.isArraySerializer = true;
    this.serializerSchema = {
      serializer: serializer
    };
  }
}

// create method for Resolver to cleanly import this Layer.
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

// the request-handler uses this isFinal flag to decide whether this serializer will be the last Layer to run.
Serializer.__layerProperties__.isFinal = true;

export default Serializer;
