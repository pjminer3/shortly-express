var _ = require('underscore');

const parseCookies = (req, res, next) => {
  if (Object.keys(req.headers).length === 0) {

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