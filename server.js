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
const {checkIdCustomer, checkIdOwner} = require('./db/queries/users.js');
app.use((req,res, next) => {
  const userId = req.session.user_id;
  const whiteList = ["/", "/login", "/register", "/logout"];

  checkIdCustomer(userId).then((data)=>{
    if (data) {
      return next();
    }
  });

  checkIdOwner(userId).then((data)=>{
    if (data) {
      return next();
    }
  });

  if (whiteList.includes(req.url)) {
    return next();
  }

  res.redirect("/login");
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
  res.render('login');
});

const { getUserPassword, getRestaurantOwnerPassword } = require('./db/queries/users.js');
app.post('/login', (req, res) => {
  getUserPassword(req.body.email).then((user) => {
    if (user.hasOwnProperty("password") && bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      return res.render('main_page');
    }
  });

  getRestaurantOwnerPassword(req.body.email).then((user) => {
    if (user.hasOwnProperty("password") && bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      return res.render('restaurant_page');
    }
  });

  // res.redirect("/login");
});

app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
