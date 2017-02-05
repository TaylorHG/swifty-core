import { get, post, controller, destroy } from '@swift-developer/swifty-rest';
import Resource from '../../../distribution/common-layers/resource';

export default class YolosResource extends Resource {

  @get()
  index(req, res) {
    res.end('get all the yolos');
  }

  @get('/:id')
  show(req, res) {
    res.end('get a yolo!');
  }

  @post()
  create(req, res) {
    res.end('create a yolo');
  }

  @destroy()
  destroy(req, res) {
    res.end('destroy a yolo');
  }
}
