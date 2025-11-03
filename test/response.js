import assert from 'node:assert/strict';
import test from 'node:test';
import response from '../lib/response.js';

test('res.sendStatus()', t => {
  const res = {
    writeHead() {
      return this;
    },
    end() {
      return this;
    }
  };
  t.mock.method(res, 'writeHead');
  t.mock.method(res, 'end');

  response()(res);
  res.sendStatus(200, 'OK');
  assert.equal(res.writeHead.mock.callCount(), 1);
  assert.deepEqual(res.writeHead.mock.calls[0].arguments, [200, 'OK']);
  assert.equal(res.end.mock.callCount(), 1);
});

test('res.send()', t => {
  const res = {
    hasHeader() {
      return false;
    },
    setHeader() {
      return this;
    },
    end() {
      return this;
    }
  };
  t.mock.method(res, 'end');
  t.mock.method(res, 'setHeader');

  response()(res);
  res.send('hello');
  assert.equal(res.end.mock.callCount(), 1);
  assert.deepEqual(res.end.mock.calls[0].arguments, ['hello']);

  assert.equal(res.setHeader.mock.callCount(), 2);
  assert.deepEqual(res.setHeader.mock.calls[0].arguments, ['Content-Type', 'text/plain; charset=utf-8']);
  assert.deepEqual(res.setHeader.mock.calls[1].arguments, ['Content-Length', 5]);
});

test('res.send() with buffer', t => {
  const res = {
    hasHeader() {
      return false;
    },
    setHeader() {
      return this;
    },
    end() {
      return this;
    }
  };
  t.mock.method(res, 'end');
  t.mock.method(res, 'setHeader');

  response()(res);
  res.send(Buffer.from('hello'));
  assert.equal(res.end.mock.callCount(), 1);
  assert.deepEqual(res.end.mock.calls[0].arguments, [Buffer.from('hello')]);

  assert.equal(res.setHeader.mock.callCount(), 2);
  assert.deepEqual(res.setHeader.mock.calls[0].arguments, ['Content-Type', 'application/octet-stream']);
  assert.deepEqual(res.setHeader.mock.calls[1].arguments, ['Content-Length', 5]);
});

test('res.send() with object', t => {
  const res = {
    json() {
      return this;
    }
  };
  t.mock.method(res, 'json');

  response()(res);
  res.send({ hello: 'world' });
  assert.equal(res.json.mock.callCount(), 1);
  assert.deepEqual(res.json.mock.calls[0].arguments, [{ hello: 'world' }]);
});

test('res.json()', t => {
  const res = {
    hasHeader() {
      return false;
    },
    setHeader() {
      return this;
    },
    end() {
      return this;
    }
  };
  t.mock.method(res, 'end');
  t.mock.method(res, 'setHeader');

  response()(res);
  res.json({ hello: 'world' });
  assert.equal(res.end.mock.callCount(), 1);
  assert.deepEqual(res.end.mock.calls[0].arguments, ['{"hello":"world"}']);

  assert.equal(res.setHeader.mock.callCount(), 2);
  assert.deepEqual(res.setHeader.mock.calls[0].arguments, ['Content-Type', 'application/json; charset=utf-8']);
  assert.deepEqual(res.setHeader.mock.calls[1].arguments, ['Content-Length', 17]);
});

test('res.redirect()', t => {
  const res = {
    writeHead() {
      return this;
    },
    end() {
      return this;
    }
  };
  t.mock.method(res, 'writeHead');
  t.mock.method(res, 'end');

  response()(res);
  res.redirect(307, 'http://example.com');
  assert.equal(res.writeHead.mock.callCount(), 1);
  assert.deepEqual(res.writeHead.mock.calls[0].arguments, [307, { location: 'http://example.com' }]);
  assert.equal(res.end.mock.callCount(), 1);
});

test('res.cookie()', t => {
  const res = {
    appendHeader() {
      return this;
    }
  };
  t.mock.method(res, 'appendHeader');

  response()(res);
  res.cookie('name', 'value', { secure: true });
  assert.equal(res.appendHeader.mock.callCount(), 1);
  assert.deepEqual(res.appendHeader.mock.calls[0].arguments, ['Set-Cookie', 'name=value; Path=/; Secure']);
});

test('res.cookie() signed', t => {
  const res = {
    appendHeader() {
      return this;
    },
    req: { secret: 'snowflake', secure: true }
  };
  t.mock.method(res, 'appendHeader');

  response()(res);
  res.cookie('name', 'value', { secure: true, signed: true });
  assert.equal(res.appendHeader.mock.callCount(), 1);
  assert.deepEqual(res.appendHeader.mock.calls[0].arguments, [
    'Set-Cookie',
    'name=s%3Avalue.zTo5vL3AGfxg%2F%2BpqyVBiEPGqMd2oXUr9%2FJvoAswaCW4; Path=/; Secure'
  ]);
});

test('res.clearCookie()', t => {
  const res = {
    appendHeader() {
      return this;
    }
  };
  t.mock.method(res, 'appendHeader');

  response()(res);
  res.clearCookie('name');
  assert.equal(res.appendHeader.mock.callCount(), 1);
  assert.deepEqual(res.appendHeader.mock.calls[0].arguments, [
    'Set-Cookie',
    'name=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ]);
});

test('res.locals must be memoized', () => {
  const res = {};
  response()(res);
  res.locals.hello = 'world';
  assert.equal(res.locals.hello, 'world');
  res.locals.hello = 'universe';
  assert.equal(res.locals.hello, 'universe');
});

test('res.header()', t => {
  const res = {
    setHeader() {
      return this;
    }
  };
  t.mock.method(res, 'setHeader');

  response()(res);
  res.header('Content-Type', 'text/plain');
  assert.equal(res.setHeader.mock.callCount(), 1);
  assert.deepEqual(res.setHeader.mock.calls[0].arguments, ['Content-Type', 'text/plain']);
});

test('res.header() with object', t => {
  const res = {
    setHeader() {
      return this;
    }
  };
  response()(res);
  t.mock.method(res, 'setHeader');

  res.header({ 'Content-Type': 'application/json', 'Content-Length': 5 });
  assert.equal(res.setHeader.mock.callCount(), 2);
  assert.deepEqual(res.setHeader.mock.calls[1].arguments, ['content-type', 'application/json']);
  assert.deepEqual(res.setHeader.mock.calls[0].arguments, ['content-length', '5']);
});
