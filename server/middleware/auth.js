const models = require('../models');
const Promise = require('bluebird');
const utils = require('../lib/hashUtils.js');

module.exports.createSession = (req, res, next) => {
  // if the sesson doesn't exist
  if (Object.keys(req.cookies).length === 0) {
    // initialize new session
    req.session = {};
    req.session.hash = utils.createRandom32String();
    
    // add hash to database with user_id
    //get user_ids 

    var options = {
      username: req.body.username,
      password: req.body.password
    };
    models.Users.get(options).then((record) => {

      if (record) {
        var userId = record.id;
        return models.Sessions.create({ hash: req.session.hash, userId: userId });
      }
    }).then(() => {
      res.cookies = {};
      res.cookies.shortlyid = {value: req.session.hash};
      next();
    });

  } else {
    //has a cookie
    console.log('SESSION IN AUTH.js: ', req.session);
    req.session = {};
    req.session.hash = req.cookies.shortlyid;
    //console.log('REQUEST SESSION HASH: ', req.session.hash);
    
    // create options object to find the sql object associated with the desired hash
    let options = {
      hash: req.cookies.shortlyid
    };

    // get said sql object
    models.Sessions.get(options).then(sessionRecord => {
      console.log('WE\'RE HERE!');
      console.log('SESSION RECORD (outside if): ', sessionRecord);
      if (sessionRecord) {
        console.log('SESSION RECORD: ', sessionRecord);
        // when we find the record we need to look up username in different table with given userID
        let options = {
          id: sessionRecord.userId
        };
        models.Users.get(options).then(userRecord => {
          
          console.log('USER RECORD: ', userRecord);
          req.session.userId = userRecord.id;
          req.session.user = {};
          req.session.user.username = userRecord.username;
          next();
        });
      } else {
        next();
      }
    })
  }

};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

