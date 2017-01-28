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
mongoose.connect('mongodb://localhost/loginapp');
const db = mongoose.connection;
const morgan = require('morgan');

const index = require('./routes/index');
const users = require('./routes/users');

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
app.set('port', (process.env.PORT || 8080));

app.listen(app.get('port'), () => {
  console.log(`Server started on port ${app.get('port')}`)
});
