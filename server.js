// load .env data into process.env
require('dotenv').config();

// Web server config
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
// const { getUserById } = require('./db/queries/users.js');

const PORT = process.env.PORT || 8080;
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Load the logger first so all (static) HTTP requests are logged to STDOUT

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSIONKEY1, process.env.SESSIONKEY2],
}));

// Separated Routes for each Resource
const customerApiRoutes = require('./routes/customers-api');
const restaurantApiRoutes = require('./routes/restaurants-api');
const authRoutes = require('./routes/auth');
const customersRoutes = require('./routes/customers');
const restaurantsRoutes = require('./routes/restaurants');
const { auth } = require('./helpers/auth');


app.use('/auth', authRoutes);
app.use('/api/customers',auth("cus", io), customerApiRoutes);
app.use('/api/restaurants',auth("res", io), restaurantApiRoutes);
app.use('/customers', auth("cus", null), customersRoutes);
app.use('/restaurants', auth("res", null), restaurantsRoutes);
// --> maybe add common api

app.get('/', (req, res) => {
  // if (req.session.user_id) {
  //   getUserById(req.session.user_id).then((user) => {
  //     const templateVar = { user: true };
  //     res.render('home_page', templateVar);
  //   });
  // } else {
  //   const templateVar = { user: false };
  //   res.render('home_page', templateVar);
  // }
  const templateVar = { user: false };
  res.render('home_page', templateVar);
});

app.get('*', (req, res) => {
  res.redirect("/");
});

server.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
