import request from './lib/request.js';
import response from './lib/response.js';

Object.assign(reqres, {
  request,
  response
});

export default function reqres(opts = {}) {
  const decorateRequest = request(opts);
  const decorateResponse = response(opts);
  return (req, res, next) => {
    decorateRequest(req);
    decorateResponse(res);
    req.res ??= res;
    next();
  };
}
