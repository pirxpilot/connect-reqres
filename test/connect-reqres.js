const test = require('node:test');
const assert = require('node:assert/strict');
const { IncomingMessage, ServerResponse } = require('node:http');

const reqres = require('../');

test('reqres must create middleware', () => {
  const middleware = reqres();
  assert.equal(typeof middleware, 'function');
  assert.equal(middleware.length, 3);
});

test('reqres must decorate request and response', (_, done) => {
  const req = {};
  const res = {};
  const app = {};
  const middleware = reqres({ app });
  middleware(req, res, err => {
    assert.ifError(err);
    assert.ok(req instanceof IncomingMessage);
    assert.ok(res instanceof ServerResponse);
    assert.equal(req.app, app);
    assert.equal(req.res, res);
    done();
  });
});
