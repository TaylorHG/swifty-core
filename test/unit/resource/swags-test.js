import { UnitTest, test } from '@swift-developer/swiftest';

export const testSubject = "resource:swags";
export default class SwagsResourceTest extends UnitTest {
  // setup() {
  //   console.log('setting up for test');
  // }
  //
  // teardown() {
  //   console.log('tearing down after test');
  // }

  @test('resource exists')
  itExists(expect) {
    expect(this.get('subject')).toNotEqual(undefined, "swags resource does not exist!");
  }
}
