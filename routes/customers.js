const express = require('express');
const router  = express.Router();
const { getRestaurantAndMenuInfo } = require('../db/queries/restaurant.js');

router.get('/menu-page', (req, res) => {
  getRestaurantAndMenuInfo().then((restaurant) => {
    const templateVar = { restaurant };
    return res.render('main_page', templateVar);
  });
});

module.exports = router;
