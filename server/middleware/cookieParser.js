var _ = require('underscore');
var auth = require('./auth');

const parseCookies = (req, res, next) => {
  // if request doesn't have any cookies 
  if (Object.keys(req.headers).length === 0) {
    // create new session 
    // Create shortlyid that is put into the database and sent back to client via the response object 
    auth.createSession(req, res, next);
  } else {
    var cookies = req.headers.cookie.split(';');
    var cookieObj = {};
    var tuples = _.map(cookies, cookie => {
      return cookie.split('=');
    });
    tuples.forEach(cookie => {
      cookieObj[cookie[0].trim()] = cookie[1];
    });

    req.cookies = cookieObj;
  }

  next();
};

module.exports = parseCookies;