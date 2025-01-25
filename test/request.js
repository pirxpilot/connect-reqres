const test = require('node:test');
const assert = require('node:assert/strict');

const request = require('../lib/request');

test('req.header()', () => {
  const req = {
    headers: {
      'content-type': 'application/json'
    }
  };
  request()(req);
  assert.equal(req.header('Content-Type'), 'application/json');
  assert.equal(req.get('Content-Type'), 'application/json');
});

test('req.host', async t => {
  const decorate = request();

  await t.test('with proxy', async t => {
    await t.test('trust proxy', () => {
      const req = {
        headersDistinct: {
          'x-forwarded-host': ['example.com'],
          host: ['localhost']
        }
      };
      decorate(req);
      assert.equal(req.host, 'example.com');
    });

    await t.test('do not trust proxy', () => {
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

  await t.test('without proxy', () => {
    const req = {
      headersDistinct: {
        host: ['example.com']
      }
    };
    decorate(req);
    assert.equal(req.host, 'example.com');
  });
});

test('req.path', () => {
  const req = {
    url: '/foo'
  };
  request()(req);
  assert.equal(req.path, '/foo');
});

test('req.hostname', async t => {
  const decorate = request();

  await t.test('with IPv6', () => {
    const req = {
      host: '[::1]:3000'
    };
    decorate(req);
    assert.equal(req.hostname, '[::1]');
  });

  await t.test('with hostname', () => {
    const req = {
      host: 'example.com:3000'
    };
    decorate(req);
    assert.equal(req.hostname, 'example.com');
  });
});

test('req.protocol', async t => {
  await t.test('trust proxy', async t => {
    await t.test('with proxy', () => {
      const req = {
        headersDistinct: {
          'x-forwarded-proto': ['http']
        }
      };
      request()(req);
      assert.equal(req.protocol, 'http');
    });

    await t.test('with proxy encrypted', () => {
      const req = {
        headersDistinct: {
          'x-forwarded-proto': ['https']
        }
      };
      request()(req);
      assert.equal(req.protocol, 'https');
    });
  });

  await t.test('do not trust proxy', async t => {
    const decorate = request({ trustProxy: false });

    await t.test('with proxy', () => {
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

    await t.test('with proxy encrypted', () => {
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

  await t.test('without proxy', () => {
    const req = {
      connection: {
        encrypted: false
      }
    };
    request()(req);
    assert.equal(req.protocol, 'http');
  });

  await t.test('encrypted without proxy', () => {
    const req = {
      connection: {
        encrypted: true
      }
    };
    request()(req);
    assert.equal(req.protocol, 'https');
  });
});

test('req.secure', async t => {
  await t.test('with proxy', () => {
    const req = {
      headersDistinct: {
        'x-forwarded-proto': ['http']
      }
    };
    request()(req);
    assert.equal(req.secure, false);
  });

  await t.test('with proxy encrypted', () => {
    const req = {
      headersDistinct: {
        'x-forwarded-proto': ['https']
      }
    };
    request()(req);
    assert.equal(req.secure, true);
  });

  await t.test('without proxy', () => {
    const req = {
      connection: {
        encrypted: false
      }
    };
    request()(req);
    assert.equal(req.secure, false);
  });

  await t.test('encrypted without proxy', () => {
    const req = {
      connection: {
        encrypted: true
      }
    };
    request()(req);
    assert.equal(req.secure, true);
  });
});

test('req.query', async t => {
  await t.test('should parse query string', () => {
    const req = {
      url: '/foo?bar=baz'
    };
    const decorate = request();
    decorate(req);
    assert.deepEqual(req.query.bar, 'baz');
  });

  await t.test('should use querystring.parse', () => {
    const req = {
      url: '/foo?bar=baz&qux=quux'
    };
    const querystring = {
      parse: str => ({ raw: str })
    };
    const decorate = request({
      querystring
    });
    decorate(req);
    assert.deepEqual(req.query, { raw: 'bar=baz&qux=quux' });
  });

  await t.test('should return empty object if no query string', () => {
    const req = {
      url: '/foo'
    };
    const decorate = request();
    decorate(req);
    assert.deepEqual(req.query, Object.create(null));
  });

  await t.test('should memoize', () => {
    const req = {
      url: '/foo?bar=baz'
    };
    const decorate = request();
    decorate(req);
    const q1 = req.query;
    assert.equal(req.query, q1);
  });
});
