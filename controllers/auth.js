const bcrypt = require("bcryptjs");
const { addANewUser } = require("../helpers/general.js");
const salt = bcrypt.genSaltSync(10);
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const { redirectBasedOnRole } = require('../helpers/redirect.js');


exports.getRegisterPage = (req, res) => {
  if (req.role) {
    const redirectPath = redirectBasedOnRole(req.role);
    return res.redirect(redirectPath);
  }

  const templateVar = { user: false };
  res.render("registration", templateVar);
};

exports.registerNewUser = (req, res) => {
  if (req.user) {
    res.send("The user already exists in the database"); // TODO: if users exist -> maybe redirect to the login page with an error
  } else {
    const param = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone_number
    };
    const password = bcrypt.hashSync(req.body.password, salt);

    stripe.customers.create(param).then((customer) => {
      return addANewUser(param, password, customer.id);
    }).then(user => {
      if (user) {
        req.session.user_id = user.id;
        res.redirect("/customers/menu-page");
      }
    }).catch((e) => {
      console.log('Error in creating Stripe customer');
    });
  }
};

exports.getLoginPage = (req, res) => {
  if (req.role) {
    const redirectPath = redirectBasedOnRole(req.role);
    return res.redirect(redirectPath);
  }

  const templateVar = { user: false };
  res.render('login', templateVar);
};

exports.logUserIntoSystem = (req, res) => {
  if (req.user && bcrypt.compareSync(req.body.password, req.user.password)) {
    req.session.user_id = req.user.id;
    const redirectPath = redirectBasedOnRole(req.user.role);
    return res.redirect(redirectPath);
  }
  res.json({ error: "Email or password was not found!" });
};


exports.logout = (req, res) => {
  req.session = null;
  res.redirect("/");
};
