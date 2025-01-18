const request = require('./lib/request');
const response = require('./lib/response');

module.exports = reqres;
Object.assign(module.exports, {
  request,
  response
});

function reqres(opts = {}) {
  const decorateRequest = request(opts);
  const decorateResponse = response(opts);
  return (req, res, next) => {
    decorateRequest(req);
    decorateResponse(res);
    req.res ??= res;
    next();
  };
}
