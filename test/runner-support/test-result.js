export default class TestResult {
  constructor(testName, testContainer, failures) {
    this._testName = testName;
    this._testContainer = testContainer;
    this._failures = failures;
  }

  get testName() {
    return this._testName;
  }

  get testContainer() {
    return this._testContainer;
  }

  get failures() {
    return this._failures;
  }
}
