// load .env data into process.env
require('dotenv').config();

// Web server config
const sassMiddleware = require('./lib/sass-middleware');
const express = require('express');
const morgan = require('morgan');

const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

const cookieSession = require('cookie-session');

const PORT = process.env.PORT || 8080;
const app = express();

app.set('view engine', 'ejs');

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  '/styles',
  sassMiddleware({
    source: __dirname + '/styles',
    destination: __dirname + '/public/styles',
    isSass: false, // false => scss, true => sass
  })
);
app.use(express.static('public'));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSIONKEY1, process.env.SESSIONKEY2],
}));

/// Redirect every routes except routes in whitelist to /login
const { getUserById } = require('./db/queries/users.js');
app.use((req, res, next) => {
  const whiteList = ["/", "/login", "/register", "/logout"];
  if (whiteList.includes(req.url)) {
    return next();
  }
  getUserById(req.session.user_id).then((data) => {
    if (data) {
      return next();
    }
    res.redirect("/");
  });
});

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const userApiRoutes = require('./routes/users-api');
const widgetApiRoutes = require('./routes/widgets-api');
const usersRoutes = require('./routes/users');

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
// Note: Endpoints that return data (eg. JSON) usually start with `/api`
app.use('/api/users', userApiRoutes);
app.use('/api/widgets', widgetApiRoutes);
app.use('/users', usersRoutes);

// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    getUserById(req.session.user_id).then((user) => {
      if (user.role === 'cus') {
        return res.redirect('/menu-page');
      }

      if (user.role === 'res') {
        return res.redirect('/restaurant-order');
      }

      res.redirect('/login');
    });
  }
  res.render('login');
});

const { getUserByEmail } = require('./db/queries/users.js');
app.post('/login', (req, res) => {
  getUserByEmail(req.body.email).then((user) => {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;

      if (user.role === 'cus') {
        return res.redirect('/menu-page');
      }

      if (user.role === 'res') {
        return res.redirect('/restaurant-order');
      }
    }
  }).catch((err) => {
    return res.json({ error: "Email or password was not found!" });
  });
});

app.get('/menu-page', (req, res) => {
  res.render('main_page');
});

app.get('/restaurant-order', (req, res) => {
  getUserById(req.session.user_id).then((user) => {
    if (user.role === 'res') {
      return res.render('restaurant_page');
    } else {
      return res.redirect('/');
    }
  });
  // res.render('restaurant_page');
});

app.get('/logout', (req, res) => { // TODO: Change to POST request
  req.session = null;
  res.redirect("/");
});

app.get('*', (req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
