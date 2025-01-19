[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# connect-reqres

Common request and response helpers expected by most Connnect/Express middleware.

## Install

```sh
$ npm install --save connect-reqres
```

## Usage

```js
const app = require('connect');
const reqres = require('connect-reqres');

app.use(reqres({
  app
}));

```

`reqres(options)` - returns middleware function

`options.app` - is a reference to `connect` app that is exposed as `req.app` property
`options.querystring` - is an object that provides `parse` method use to parse URL query string - by default `node:querystring` is used
`options.trustProxy` - if falsy `reqres` will ignore `x-forwarded-host` and `x-forwarded-proto` headers - by default it is true

The `reqres` middleware decorates `request` and `response` objects.
Request decorations include:
- methods:
  - `header()`
  - `get()` alias for `header`
- properties:
  - `app`
  - `host`
  - `hostname`
  - `path`
  - `protocol`
  - `res` - back reference to back
  - `query`
  - `secure`

Response decorations include:
- methods:
  - `clearCookie()`
  - `cookie()`
  - `header()`
  - `json()`
  - `redirect()`
  - `send()`
  - `sendStatus()`
- properties:
  - `locals`


## License

MIT © [Damian Krzeminski](https://pirxpilot.me)

[npm-image]: https://img.shields.io/npm/v/connect-reqres
[npm-url]: https://npmjs.org/package/connect-reqres

[build-url]: https://github.com/pirxpilot/connect-reqres/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/pirxpilot/connect-reqres/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/connect-reqres
[deps-url]: https://libraries.io/npm/connect-reqres
