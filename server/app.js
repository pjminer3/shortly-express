const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
var cookieParse = require('./middleware/cookieParser.js');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/', (req, res, next) => {
  console.log('RUNNING get /');
  cookieParse(req, res, function() {
    Auth.createSession(req, res, function() {
      if(models.Sessions.isLoggedIn(req.session)) {
        res.render('index');
      } else {
        res.render('login');
      }
    });
  });

});

app.get('/create', (req, res) => {
  console.log('RUNNING get /');
  cookieParse(req, res, function() {
    Auth.createSession(req, res, function() {
      if(models.Sessions.isLoggedIn(req.session)) {
        res.render('index');
      } else {
        res.render('login');
      }
    });
  });

});

app.get('/links', (req, res, next) => {
  console.log('RUNNING get /links');
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links', (req, res, next) => {
  console.log('RUNNING post /links');
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/login', (req, res, next) => {
  console.log('RUNNING get /login');
  res.render('login');
});

app.get('/signup', (req, res, next) => {
  console.log('RUNNING get /signup');
  res.render('signup');
});



app.post('/login', (req, res, next) => {

  
  console.log('RUNNING post /login');
  // make options
  let options = {
    username: req.body.username
  };

  // Check if supplied login user exits
  models.Users.get(options).then(record => {
    // if exists, check to make sure their password matches the password in db
    if (record !== undefined) {
      if (models.Users.compare(req.body.password, record.password, record.salt)) {
        // create a session
        res.redirect('/');
      } else {
        // send back to login bc bad password
        res.redirect('/login');
      }
    } else {
      // if user doesn't exist send back to login
      res.redirect('/login');
    }
  });
});

// creates new user => if user exists; redirect back to signup page
app.post('/signup', (req, res, next) => {
  console.log('RUNNING post /signup');
  models.Users.create(req.body).then((resolved) => {
    res.redirect('/');
  }).catch(err => {
    res.redirect('/signup');
  });
});




/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {
  console.log('RUNNING get /code');
  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
