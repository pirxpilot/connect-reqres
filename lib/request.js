const { IncomingMessage } = require('node:http');
const parseurl = require('parseurl');

const { defineGetter, defineMemoGetter } = require('./helpers');

module.exports = makeDecorator;

function makeDecorator(opts = {}) {
  const { querystring = require('node:querystring'), trustProxy = true } = opts;
  const proto = Object.create(IncomingMessage.prototype);
  Object.assign(proto, {
    get: header,
    header
  });
  if (trustProxy) {
    defineGetter(proto, 'host', proxyHost);
    defineMemoGetter(proto, 'protocol', proxyProtocol);
  } else {
    defineGetter(proto, 'host', host);
    defineMemoGetter(proto, 'protocol', protocol);
  }

  defineGetter(proto, 'app', app);
  defineGetter(proto, 'path', path);
  defineMemoGetter(proto, 'hostname', hostname);
  defineGetter(proto, 'secure', secure);
  defineMemoGetter(proto, 'query', query);
  return decorate;

  function decorate(req) {
    Object.setPrototypeOf(req, proto);
    return proto;
  }

  function app() {
    return opts.app;
  }

  /**
   * Parse the "Host" header field to a host.
   */
  function host() {
    return this.headersDistinct.host?.[0];
  }

  function proxyHost() {
    return this.headersDistinct['x-forwarded-host']?.[0] ?? host.call(this);
  }

  /**
   * `pathname` part of the request URL.
   */
  function path() {
    return parseurl(this).pathname;
  }

  /**
   * Parse the "Host" header field to a hostname.
   */
  function hostname() {
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
  }

  function protocol() {
    return this.connection.encrypted ? 'https' : 'http';
  }

  function proxyProtocol() {
    return (
      this.headersDistinct['x-forwarded-proto']?.[0].trim() ??
      protocol.call(this)
    );
  }

  function secure() {
    return this.protocol === 'https';
  }

  /**
   * Parse search parameters to an object.
   */
  function query() {
    const { query } = parseurl(this);
    return querystring.parse(query);
  }

  function header(h) {
    return this.headers[h.toLowerCase()];
  }
}
