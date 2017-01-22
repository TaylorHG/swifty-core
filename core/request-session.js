export default class RequestSession {
  constructor(req, res) {
    this.req = req;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.res = res;
    this.layerResults = {};
    this.handled = false;
    this.controllerResult = undefined;
    this.result = undefined;
  }

  storeLayerResult(layerName, layerResult) {
    layerResults[layerName] = layerResult;
  }

  setResult(result) {
    if (this.result !== undefined) {
      console.error('Result can only be set once!');
    } else {
      this.result = result;
    }
  }

  end() {
    this.res.end(this.result);
  }
}
