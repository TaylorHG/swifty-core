export default function test() {
  /**
   * Decorate a function and mark it as a runnable test
   * @param  {Class} target           Class that owns the function
   * @param  {String} key             Name of the function
   * @param  {Descriptor} descriptor  Descriptor that needs to be returned.
   * @return {[type]}            [description]
   */
  return function (target, key, descriptor) {
    var methodHandler = descriptor.value;

    // register this test with the test class or merge it with existing settings.
    var testContainer = target.getContainerForTest(key);
    testContainer.test = target[key];

    return descriptor;
  }
}
