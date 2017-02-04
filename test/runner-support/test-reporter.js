import colors from 'colors/safe';

export default class TestReporter {
  constructor() {
    this.testResults = [];
  }

  addTestResult(testResult) {
    this.testResults.push(testResult);
  }

  printResults() {
    var failures = this.testResults.filter(function(testResult) {
      return testResult.failures !== undefined;
    });

    console.log('Results:');
    console.log(colors.green(`Tests Passed: ${this.testResults.length - failures.length}`));
    console.log(colors.red(`Tests Failed: ${failures.length}`));
    console.log('');

    // if we have failures, print them and exit the process with a failure code
    if (failures.length) {
      console.log('Failures:');

      failures.forEach((failure) => {
        this.printFailure(failure);
      });

      process.exit(1);
    }

    // if we don't have any failures, exit with a success code
    process.exit();
  }

  printFailure(failedTest) {
    console.log(colors.red(`Test Failed: ${failedTest.testName} ->`));
    console.log(failedTest.failures);
    console.log(colors.red(`located at: ${failedTest.testContainer.filename}`));
    console.log('\n');
  }
}
