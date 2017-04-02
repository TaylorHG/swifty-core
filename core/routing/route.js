import RouteBlueprint from './route-blueprint';

export default class Route {
  constructor(parent, ...args) {
    // parse arguments
    this.blueprint = new RouteBlueprint(args);

    // set parent
    this.parent = parent;

    // set fullpath
    this.fullpath = `${parent.fullpath}${this.blueprint.path}`;

    // set array of children routes to be appended to.
    this.routes = [];

    // call the child function with this route's scope
    if (this.blueprint.extension !== undefined)
      this.blueprint.extension.call(this);
  }

  route(...args) {
    var newRoute = new Route(this, ...args);
    this.routes.push(newRoute);
  }
}
