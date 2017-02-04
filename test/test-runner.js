import TestLoader from './runner-support/test-loader';
import TestReporter from './runner-support/test-reporter';
import TestResult from './runner-support/test-result';
import SwiftyCore from '../distribution/core';

import colors from 'colors/safe';
import expect from 'expect';

export default class TestRunner {
  constructor() {
    this.testReporter = new TestReporter();
    // TODO it's time to pull this test framework into it's own repo, that way requiring this thing becomes easy, right now it's painful as fuck. None of the paths seem to work.
    this.app = new SwiftyCore();
  }

  run() {
    var testRunner = this;
    var testLoader = new TestLoader();

    // build application to test
    console.log('Building Application to Test...');
    this.app.run({
      "httpManager": "@swift-developer/swifty-rest",
      "port": 19842
    }).then(function() {
      console.log('Application Built!');

      // build and run test suite

      console.log('Loading Test Suite...');
      testLoader.loadFiles(`${process.cwd()}/test-dist`).then(function() {
        console.log('Test Suite Loaded. Running tests...');
        testLoader.testContainers.forEach(function(testContainer) {
          testRunner.runTestModule(testContainer);
        });
        console.log('\nTest Suite Finished\n');

        testRunner.testReporter.printResults();
      }, function(e) {
        console.error('Tests failed to load: Reason:');
        console.error(e);
      });
    });
  }

  runTestModule(testContainer) {
    // save the test module instance so that when we wrap assertions we can execute them in the test module instance's scope.
    var testModuleInstance = new testContainer.testModule();

    // inject necessary dependencies
    let testSubjectToInject = this.app.get('resolver').getLayerByKey(testContainer.testSubject);
    if (testSubjectToInject === undefined) {
      var testResult = new TestResult('Test Module Initialization', testContainer, new Error(`Layer with key ${testContainer.testSubject} was not found!`));
      this.testReporter.addTestResult(testResult);
      return;
    }
    var tests = testModuleInstance.tests;
    for (let testName in tests) {
      if (tests.hasOwnProperty(testName)) {

        // re-inject the dependency between test runs
        let testSubjectToInject = this.app.get('resolver').getLayerByKey(testContainer.testSubject);
        testModuleInstance.set('subject', testSubjectToInject);

        // run the test and capture any errors it produces. unfortunately expect does not throw specific errors, so we have to catch all of them.
        try {
          tests[testName].test.apply(testModuleInstance, [expect]);
        } catch(e) {
          // test failed
          var testResult = new TestResult(testName, testContainer, e);
          this.testReporter.addTestResult(testResult);
          process.stdout.write(colors.red('.'));
          continue;
        }
        // test succeeded
        var testResult = new TestResult(testName, testContainer);
        this.testReporter.addTestResult(testResult);
        process.stdout.write(colors.green('.'));
      }
    }
  }
}

setTimeout(function() {
  var runner = new TestRunner();
  runner.run();
}, 1);

// runner.run();
