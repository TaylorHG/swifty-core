export default class RouteBlueprint {
  constructor(blueprint) {
    this._path = blueprint[0];
    this._options = blueprint[1];
    if (this._options === undefined)
      this._options = { resource: this._path };
    if (blueprint[2] instanceof Function)
      this._extension = blueprint[2];
  }

  get path() {
    return this._path;
  }

  get options() {
    return this._options;
  }

  get extension() {
    return this._extension;
  }
}
