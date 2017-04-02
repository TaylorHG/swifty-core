import { LOGGER } from '@swift-developer/swifty-logger';

/**
 * Error thrown when a resource is missing
 */
export default class ResourceNotFound {
  constructor(message) {
    this.name = 'ResourceNotFound';
    LOGGER.error(message);
    this.message = message;
  }
}
ResourceNotFound.prototype = Object.create(Error.prototype);
