const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');
const morgan = require('morgan');
const index = require('./routes/index');
const users = require('./routes/users');


/* CONFIGURATION */
const {DATABASE_URL, PORT} = require('./config/database');
mongoose.connect(DATABASE_URL); // connects to database?
require('./config/passport')(passport);  // example easy-node-auth



// Init app
const app = express();

// logging
app.use(morgan('common'));


// View Engine
// app.set('views', path.join(__dirname + 'views'));
app.set('views', path.join(__dirname + '/views'));
app.engine('handlebars', expressHandlebars({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// native promises
mongoose.Promise = global.Promise;

// Set Static Folder
// diff than the tutorial video
app.use('/public', express.static('public'));

// Express session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());


// Express validator
// from: https://github.com/ctavan/express-validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash Middleware
app.use(flash());

// Global vars for flash messages
// Use 'res.locals' - to make a gloabl variable or function
app.use((req, res, next) => {
  res.locals.sucess_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); // for passport
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', index);
app.use('/users', users);

// Set port
// both runServer and closeServer need to access the same
// server object, so we declare `server` here, and then when
// runServer runs, it assigns a value.
let server;

// this function starts our server and returns a Promise.
// In our test code, we need a way of asynchrnously starting
// our server, since we'll be dealing with promises there.

function runServer() {
  return new Promise((resolve, reject) => {
    server = app.listen(PORT, () => {
      console.log(`Your app is listening on port ${PORT}`);
      resolve(server);
    }).on('error', err => {
      reject(err)
    });
  });
}

// like `runServer`, this function also needs to return a promise.
// `server.close` does not return a promise on its own, so we manually
// create one.
function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
