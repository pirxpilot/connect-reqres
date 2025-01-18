const { IncomingMessage } = require('node:http');
const parseurl = require('parseurl');

const { defineGetter, defineMemoGetter } = require('./helpers');

module.exports = makeDecorator;

function makeDecorator(opts) {
  const {
    querystring = require('node:querystring')
  } = opts;
  const proto = Object.create(IncomingMessage.prototype);
  Object.assign(proto, {
    get: header,
    header
  });

  defineGetter(proto, 'app', function app() {
    return opts.app;
  });

  /**
   * Parse the "Host" header field to a host.
   */
  defineGetter(proto, 'host', function host() {
    const { headersDistinct } = this;
    return headersDistinct['x-forwarded-host']?.[0] ??
      headersDistinct.host?.[0];
  });

  /**
   * `pathname` part of the request URL.
   */
  defineGetter(proto, 'path', function path() {
    return parseurl(this).pathname;
  });

  /**
   * Parse the "Host" header field to a hostname.
   */
  defineMemoGetter(proto, 'hostname', function hostname() {
    const { host } = this;

    if (!host) {
      return;
    }
    if ('[' === host[0] && ']' === host.at(-1)) {
      // IPv6 address
      return host;
    }
    const index = host.lastIndexOf(':');
    return index !== -1 ? host.slice(0, index) : host;
  });

  defineMemoGetter(proto, 'protocol', function protocol() {
    return this.headersDistinct['x-forwarded-proto']?.[0].trim() ??
      this.connection.encrypted ? 'https' : 'http';
  });

  defineGetter(proto, 'secure', function secure() {
    return this.protocol === 'https';
  });

  /**
   * Parse search parameters to an object.
   */
  defineMemoGetter(proto, 'query', function query() {
    const { query } = parseurl(this);
    return querystring.parse(query);
  });

  return decorate;

  function decorate(req) {
    Object.setPrototypeOf(req, proto);
    return proto;
  }

  function header(h) {
    return this.headers[h.toLowerCase()];
  }
}

