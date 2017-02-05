import { Serializer } from '@swift-developer/swifty-serializer';

export default class SwagSerializer extends Serializer {
  define() {
    this.attr('name', 'string');
    this.attr('createdAt', 'string');
  }
}
