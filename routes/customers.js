const express = require('express');
const router  = express.Router();

const { getRestaurantAndMenuInfo } = require('../db/queries/restaurant.js');
router.get('/menu-page', (req, res) => {
  getRestaurantAndMenuInfo().then((restaurant) => {
    console.log(restaurant);
    const templateVar = { restaurant };
    console.log(templateVar);
    return res.render('main_page', templateVar);
  });
});

module.exports = router;
