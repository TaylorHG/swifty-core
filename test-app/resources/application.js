import Resource from '../../../distribution/common-layers/resource';
import { get } from '@swift-developer/swifty-rest';
import { LOGGER } from '@swift-developer/swifty-logger';

export default class ApplicationResource extends Resource {

  @get()
  index(req, res) {
    LOGGER.info('application route index hit!');
  }

  @get('/:id')
  show(req, res) {
    LOGGER.info('application route show hit!');
  }

}
