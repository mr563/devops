// myModule.test.js

const myModule = require('./myModule');

describe('myModule', () => {
  test('should return the sum of two numbers', () => {
    expect(myModule.add(1, 2)).toBe(3);
  });

  test('should return the difference of two numbers', () => {
    expect(myModule.subtract(5, 3)).toBe(2);
  });
});
