import Router from '../../distribution/common-layers/router';

export default class ApplicationRouter extends Router {
  map() {
    this.route('/', { resource: 'application' }, function() { // creating a root route which all requests will pass through
      this.route('swags'); // in this case the "swags" resource will be used, (defaults to path name)
      this.route('yolos', { resource: 'yolos' }); // in this case the "yolos" resource will be used
    });
  }
}
