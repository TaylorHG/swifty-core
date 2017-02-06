import { get, post, controller, destroy } from '@swift-developer/swifty-rest';
import { serializer } from '@swift-developer/swifty-serializer';
import Resource from '../../../distribution/common-layers/resource';

class Swag {
  constructor(name, createdAt) {
    this.name = name;
    this.createdAt = createdAt;
  }
}

export default class SwagsResource extends Resource {

  @get()
  @serializer('serializer:swags')
  index(req, res) {
    var swag1 = new Swag("gold chain", "1989");
    var swag2 = new Swag("new album", "1989");
    return [swag1, swag2];
  }

  @get('/:id')
  @serializer('serializer:swag')
  show(req, res) {
    var swag = new Swag("gold chain", "1989");
    return swag;
  }

  @post()
  create(req, res) {
    res.end('create a swag');
  }

  @destroy()
  destroy(req, res) {
    res.end('destroy a swag');
  }
}
