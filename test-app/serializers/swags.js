import { Serializer } from '@swift-developer/swifty-serializer';

export default class SwagsSerializer extends Serializer {
  define() {
    this.array('serializer:swag');
  }
}
