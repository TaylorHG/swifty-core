import { LOGGER } from './utils/logger';

export default class RequestSession {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.layerResults = {};
    this.handled = false;
    this.resourceResult = undefined;
    this.result = undefined;
  }

  storeLayerResult(layerName, layerResult) {
    layerResults[layerName] = layerResult;
  }

  setResult(result) {
    if (this.result !== undefined) {
      LOGGER.error('Result can only be set once!');
    } else {
      this.result = result;
    }
  }

  end() {
    this.res.end(this.result);
  }
}
