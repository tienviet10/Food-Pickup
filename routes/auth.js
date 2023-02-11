/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into /users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

router.get('/register', (req, res) => {
  res.render("registration",);
});

const { getUserById } = require('../db/queries/users.js');
router.get('/login', (req, res) => {
  if (req.session.user_id) {
    getUserById(req.session.user_id).then((user) => {
      if (user.role === 'cus') {
        return res.redirect('/customers/menu-page');
      }

      if (user.role === 'res') {
        return res.redirect('/restaurants/restaurant-order');
      }

      res.redirect('/auth/login');
    });
  }
  res.render('login');
});

router.get('/logout', (req, res) => { // TODO: Change to POST request
  req.session = null;
  res.redirect("/");
});

const { addNewUser } = require('../db/queries/users.js');
router.post('/register', (req, res) => {
  getUserByEmail(req.body.email).then((user) => {
    if (user) {
      res.send("Exist"); // TODO: if users exist -> maybe redirect to the login page with an error
    } else {
      const password = bcrypt.hashSync(req.body.password, salt);
      return addNewUser(req.body.name, req.body.email, password, req.body.phone_number)
        .then(user => {
          if (user) {
            res.redirect("/");
          }
        });
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/register'); // TODO: display with errors
  });
});


const { getUserByEmail } = require('../db/queries/users.js');
router.post('/login', (req, res) => {
  getUserByEmail(req.body.email).then((user) => {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;

      if (user.role === 'cus') {
        return res.redirect('/customers/menu-page');
      }

      if (user.role === 'res') {
        return res.redirect('/restaurants/restaurant-order');
      }
    }
  }).catch((err) => {
    return res.json({ error: "Email or password was not found!" });
  });
});

// router.get('/', (req, res) => {
//   res.render('users');
// });

module.exports = router;
