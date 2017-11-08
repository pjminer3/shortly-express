const models = require('../models');
const Promise = require('bluebird');
const utils = require('../lib/hashUtils.js');

module.exports.createSession = (req, res, next) => {
  // if the sesson doesn't exist
  if (!req.cookies || !req.cookies.shortlyid) {
    // initialize new session
    createSessionAndPost(req, res, next);
    
  } else {
    //has a cookie

    // if cookie does not exists in the DB
      //createSessionAndPost(req, res, next);
    models.Sessions.get({hash: req.cookies.shortlyid}).then((record) => {
      if (record === undefined) {
          // doesnt exist in DB
        createSessionAndPost(req, res, next);
      } else {

//----------------
        // add hash to existing session, or to new session
        if (!req.session) { req.session = {}; }
        req.session.hash = req.cookies.shortlyid;

        if (models.Sessions.isLoggedIn(req.session)) {
          // if they are logged in...
          next();
        } else {
          // if they are not logged in...
          // adding username and userId when assigned 
          models.Sessions.get({hash: req.cookies.shortlyid}).then( record => {
            return models.Users.get({id: record.userId});
          }).then( userRecord => {
            if (userRecord) {
              // create user object, username, userId on the req.session
              populateSessionUser (req, res, next, userRecord);
            } else {
              next();
            }
          });
        }
  //-----------------


      }
    });






  }

};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

function createSessionAndPost (req, res, next) {
  models.Sessions.create().then( insertRes => {
        //console.log('INSERTED ROW: ', insertRes);
    return models.Sessions.get({id: insertRes.insertId});
  }).then( record => {
        // adding session to request
    req.session = {hash: record.hash};
        // adding cookie to response
    res.cookies = {shortlyid: {value: record.hash}};
    res.cookie('shortlyid', record.hash);
    next();
  });
}

function populateSessionUser (req, res, next, userRecord) {
  req.session.user = {};
  req.session.user.username = userRecord.username;
  req.session.userId = userRecord.id;
  next();
}