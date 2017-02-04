import RunnableTest from '../runnable-test-support';
import TestContainer from '../test-container';

export default class UnitTest extends RunnableTest {

  getContainerForTest(testName) {
    var testContainer;

    if (this.tests === undefined) {
      this.tests = {};
    }

    if (this.tests[testName]) {
      var testContainer = this.tests[testName];
    } else {
      testContainer = new TestContainer(testName);
      this.tests[testName] = testContainer;
    }

    return testContainer;
  }
}
