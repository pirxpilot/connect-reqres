const { ServerResponse } = require('node:http');
const { Buffer } = require('node:buffer');
const process = require('node:process');

const { serialize } = require('cookie');
const { sign } = require('cookie-signature');
const { defineMemoGetter } = require('./helpers');

module.exports = makeDecorator;

function makeDecorator() {

  const proto = Object.create(ServerResponse.prototype);
  Object.assign(proto, {
    header,
    json,
    redirect,
    send,
    sendStatus,
    cookie,
    clearCookie
  });

  defineMemoGetter(proto, 'locals', function locals() {
    return Object.create(null);
  });

  return decorate;

  function decorate(res) {
    Object.setPrototypeOf(res, proto);
    return proto;
  }

  function sendStatus(status, message) {
    return this.writeHead(status, message).end();
  }

  function send(body) {
    if (Buffer.isBuffer(body)) {
      process.emitWarning(new Error('Sending a Buffer as a response body is deprecated.'));
      if (!this.hasHeader('Content-Type')) {
        this.setHeader('Content-Type', 'application/octet-stream');
      }
      this.setHeader('Content-Length', body.length);
      return this.end(body);
    }
    if (typeof body === 'object') {
      return this.json(body);
    }
    if (typeof body === 'string') {
      process.emitWarning(new Error('Sending a String as a response body is deprecated.'));
      if (!this.hasHeader('Content-Type')) {
        this.setHeader('Content-Type', 'text/plain; charset=utf-8');
      }
      this.setHeader('Content-Length', Buffer.byteLength(body));
      return this.end(body);
    }
    process.emitWarning(new Error(`Unsupported response body type ${typeof body}`));
    const str = String(body);
    this.setHeader('Content-Length', Buffer.byteLength(str));
    this.end(str);
  }

  function json(obj) {
    if (!this.hasHeader('Content-Type')) {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    const payload = JSON.stringify(obj);
    this.setHeader('Content-Length', Buffer.byteLength(payload));
    return this.end(payload);
  }

  function redirect(status, location) {
    if (!location) {
      location = status;
      status = 307; // Temporary Redirect
    }
    this.writeHead(status, { location }).end();
  }

  function header(obj, ...args) {
    return (typeof obj === 'string') ?
      this.setHeader(obj, ...args) :
      this.setHeaders(new Headers(obj));
  }

  function cookie(name, value, options = {}) {
    const { signed } = options;

    if (signed) {
      const { secret } = this.req;
      if (!secret) {
        throw new Error('cookieParser("secret") required for signed cookies');
      }
      value = 's:' + sign(value, secret);
    }

    const { maxAge, ...opts } = { ...options };
    opts.path ??= '/';
    if (maxAge != null) {
      if (!isNaN(maxAge)) {
        opts.expires = new Date(Date.now() + maxAge);
        opts.maxAge = Math.floor(maxAge / 1000);
      }
    }

    this.appendHeader('Set-Cookie', serialize(name, value, opts));

    return this;
  }

  function clearCookie(name, options) {
    const expires = new Date(1);  // past date
    const { maxAge, ...opts } = { path: '/', ...options, expires };
    void maxAge; // ignore maxAge
    return this.cookie(name, '', opts);
  }
}
