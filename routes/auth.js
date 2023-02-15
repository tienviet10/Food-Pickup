const express = require('express');
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const router  = express.Router();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const { getUserById, addNewUser, getUserByEmail } = require('../db/queries/users.js');

router.get('/register', (req, res) => {
  res.render("registration",);
});

router.get('/login', (req, res) => {
  if (req.session.user_id) {
    getUserById(req.session.user_id).then((user) => {
      if (user.role === 'cus') {
        return res.redirect('/customers/menu-page');
      }

      if (user.role === 'res') {
        return res.redirect('/restaurants/restaurant-order');
      }

      return res.redirect('/auth/login');
    });
  } else {
    res.render('login');
  }
});

router.get('/logout', (req, res) => { // TODO: Change to POST request
  req.session = null;
  res.redirect("/");
});

router.post('/register', (req, res) => {
  getUserByEmail(req.body.email).then((user) => {
    if (user) {
      res.send("Exist"); // TODO: if users exist -> maybe redirect to the login page with an error
    } else {
      const param = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone_number
      };
      return stripe.customers.create(param).then((customer)=>{
        const password = bcrypt.hashSync(req.body.password, salt);
        return addNewUser(req.body.name, req.body.email, password, req.body.phone_number, customer.id)
          .then(user => {
            if (user) {
              res.redirect("/");
            }
          });
      });
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/register'); // TODO: display with errors
  });
});


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

module.exports = router;
