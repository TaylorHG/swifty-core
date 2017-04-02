import Resource from '../../../distribution/common-layers/resource';
import { get } from '@swift-developer/swifty-rest';

export default class ApplicationResource extends Resource {

  @get()
  index(req, res) {
    console.log('application route index hit!');
  }

  @get('/:id')
  show(req, res) {
    console.log('application route show hit!');
  }

}
