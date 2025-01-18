const test = require('node:test');
const assert = require('node:assert/strict');
const reqres = require('../');

test('reqres must create middleware', function () {
  const middleware = reqres();
  assert.equal(typeof middleware, 'function');
  assert.equal(middleware.length, 3);
});
