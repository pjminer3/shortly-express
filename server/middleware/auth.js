const models = require('../models');
const Promise = require('bluebird');
const utils = require('../lib/hashUtils.js');

module.exports.createSession = (req, res, next) => {

  if (Object.keys(req.cookies).length === 0) {
    // initialize new session
    console.log('request.session: ', req.session);
    req.session.hash = utils.createRandom32String();
    // add hash to database with user_id
    //get user_ids 
    var option = {
      username: req.body.username,
      password: req.body.password
    };
    models.Users.get(options).then((record) => {
      if (record) {
        var userId = record.id;
        return models.Sessions.create({ hash: req.session.hash, userId: userId });
      }
    }).then(() => {
      res.headers.session = req.session.hash;
      next();
    });

  } else {
    //has a cookie
  }

};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

