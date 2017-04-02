import Router from '../../distribution/common-layers/router';

export default class ApplicationRouter extends Router {
  map() {
    this.route('/', { resource: 'application' }, function() {
      this.route('swags');
      this.route('yolos', { resource: 'yolos' });
    });
  }
}
