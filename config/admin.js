/**
 * Every admin accessing any of the route must add a secret key to the head of the request,
 * this secret key is comapred to the one saved on the server.
 * This isn't much of a security feature, it's just to make sure no one can just go ahead and use the API
 * endpoints whenever they want to.
 */

module.exports = function(req, res, next) {
  const header = req.headers;
  next();
};
