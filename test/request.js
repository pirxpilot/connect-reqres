const test = require('node:test');
const assert = require('node:assert/strict');

const request = require('../lib/request');

test('req.header()', function () {
  const req = {
    headers: {
      'content-type': 'application/json'
    }
  };
  request()(req);
  assert.equal(req.header('Content-Type'), 'application/json');
  assert.equal(req.get('Content-Type'), 'application/json');
});

test('req.host', async function (t) {
  const decorate = request();

  await t.test('with proxy', async function (t) {
    await t.test('trust proxy', function () {
      const req = {
        headersDistinct: {
          'x-forwarded-host': ['example.com'],
          host: ['localhost']
        }
      };
      decorate(req);
      assert.equal(req.host, 'example.com');
    });

    await t.test('do not trust proxy', function () {
      const req = {
        headersDistinct: {
          'x-forwarded-host': ['example.com'],
          host: ['localhost']
        }
      };
      request({ trustProxy: false })(req);
      assert.equal(req.host, 'localhost');
    });
  });

  await t.test('without proxy', function () {
    const req = {
      headersDistinct: {
        host: ['example.com']
      }
    };
    decorate(req);
    assert.equal(req.host, 'example.com');
  });
});

test('req.path', function () {
  const req = {
    url: '/foo'
  };
  request()(req);
  assert.equal(req.path, '/foo');
});

test('req.hostname', async function (t) {
  const decorate = request();

  await t.test('with IPv6', function () {
    const req = {
      host: '[::1]:3000'
    };
    decorate(req);
    assert.equal(req.hostname, '[::1]');
  });

  await t.test('with hostname', function () {
    const req = {
      host: 'example.com:3000'
    };
    decorate(req);
    assert.equal(req.hostname, 'example.com');
  });
});

test('req.protocol', async function (t) {
  await t.test('trust proxy', async function (t) {
    await t.test('with proxy', function () {
      const req = {
        headersDistinct: {
          'x-forwarded-proto': ['http']
        }
      };
      request()(req);
      assert.equal(req.protocol, 'http');
    });

    await t.test('with proxy encrypted', function () {
      const req = {
        headersDistinct: {
          'x-forwarded-proto': ['https']
        }
      };
      request()(req);
      assert.equal(req.protocol, 'https');
    });
  });

  await t.test('do not trust proxy', async function (t) {
    const decorate = request({ trustProxy: false });

    await t.test('with proxy', function () {
      const req = {
        headersDistinct: {
          'x-forwarded-proto': ['http']
        },
        connection: {
          encrypted: true
        }
      };
      decorate(req);
      assert.equal(req.protocol, 'https');
    });

    await t.test('with proxy encrypted', function () {
      const req = {
        headersDistinct: {
          'x-forwarded-proto': ['https']
        },
        connection: {
          encrypted: false
        }
      };
      decorate(req);
      assert.equal(req.protocol, 'http');
    });
  });

  await t.test('without proxy', function () {
    const req = {
      connection: {
        encrypted: false
      }
    };
    request()(req);
    assert.equal(req.protocol, 'http');
  });

  await t.test('encrypted without proxy', function () {
    const req = {
      connection: {
        encrypted: true
      }
    };
    request()(req);
    assert.equal(req.protocol, 'https');
  });
});

test('req.secure', async function (t) {
  await t.test('with proxy', function () {
    const req = {
      headersDistinct: {
        'x-forwarded-proto': ['http']
      }
    };
    request()(req);
    assert.equal(req.secure, false);
  });

  await t.test('with proxy encrypted', function () {
    const req = {
      headersDistinct: {
        'x-forwarded-proto': ['https']
      }
    };
    request()(req);
    assert.equal(req.secure, true);
  });

  await t.test('without proxy', function () {
    const req = {
      connection: {
        encrypted: false
      }
    };
    request()(req);
    assert.equal(req.secure, false);
  });

  await t.test('encrypted without proxy', function () {
    const req = {
      connection: {
        encrypted: true
      }
    };
    request()(req);
    assert.equal(req.secure, true);
  });
});

test('req.query', async function (t) {
  await t.test('should parse query string', function () {
    const req = {
      url: '/foo?bar=baz'
    };
    const decorate = request();
    decorate(req);
    assert.deepEqual(req.query.bar, 'baz');
  });

  await t.test('should use querystring.parse', function () {
    const req = {
      url: '/foo?bar=baz&qux=quux'
    };
    const querystring = {
      parse: function (str) {
        return { raw: str };
      }
    };
    const decorate = request({
      querystring
    });
    decorate(req);
    assert.deepEqual(req.query, { raw: 'bar=baz&qux=quux' });
  });

  await t.test('should return empty object if no query string', function () {
    const req = {
      url: '/foo'
    };
    const decorate = request();
    decorate(req);
    assert.deepEqual(req.query, Object.create(null));
  });

  await t.test('should memoize', function () {
    const req = {
      url: '/foo?bar=baz'
    };
    const decorate = request();
    decorate(req);
    const q1 = req.query;
    assert.equal(req.query, q1);
  });
});
