/* eslint-disable jest/no-export, jest/expect-expect */
const registerDummyTest = (context) => {
  const { describe, it, assert } = context;
  describe('Testing quench with 1+1 = 2', function () {
    it('Passing Test', function () {
      assert.strictEqual(2, 1 + 1);
    });
  });
};

export default registerDummyTest;
