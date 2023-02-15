const express = require('express');
const router  = express.Router();
const { getRestaurantAndMenuInfo } = require('../db/queries/restaurant.js');

router.get('/menu-page', (req, res) => {
  getRestaurantAndMenuInfo().then((restaurant) => {
    const templateVar = { restaurant, user: true };
    return res.render('main_page', templateVar);
  });
});

router.get('/orders-page', (req, res) => {
  const templateVar = { user: true };
  res.render('customer_orders', templateVar);
});

module.exports = router;
