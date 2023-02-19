const express = require('express');
const router = express.Router();

const { roleValidate, validateUserEmail } = require('../helpers/auth.js');
const {
  getRegisterPage,
  getLoginPage,
  logout,
  registerNewUser,
  logUserIntoSystem
} = require("../controllers/auth");

router.get('/register', roleValidate, getRegisterPage);

router.post('/register', validateUserEmail, registerNewUser);

router.get('/login',roleValidate, getLoginPage);

router.post('/login', validateUserEmail, logUserIntoSystem);

router.get('/logout', logout);

module.exports = router;
