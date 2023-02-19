require('dotenv').config();

// Web server config
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');

const PORT = process.env.PORT || 8080;
const app = express();

// Set up socket io
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


const customerApiRoutes = require('./routes/customers-api');
const restaurantApiRoutes = require('./routes/restaurants-api');
const authRoutes = require('./routes/auth');
const customersRoutes = require('./routes/customers');
const restaurantsRoutes = require('./routes/restaurants');
const { auth, roleValidate } = require('./helpers/auth');
const { returnHomePage } = require('./controllers/home');

// Separated Routes for each Resource
app.use('/auth', authRoutes);
app.use('/api/customers', auth("cus", io), customerApiRoutes);
app.use('/api/restaurants', auth("res", io), restaurantApiRoutes);
app.use('/customers', auth("cus", null), customersRoutes);
app.use('/restaurants', auth("res", null), restaurantsRoutes);

app.get('/', roleValidate, returnHomePage);

app.get('*', (req, res) => {
  res.redirect("/");
});

server.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
