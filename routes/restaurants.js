const express = require('express');
const router  = express.Router();
const { getOrders } = require('../db/queries/orders');
const { getUserById } = require('../db/queries/users');


router.get('/restaurant-order', (req, res) => {
  getUserById(req.session.user_id).then((user) => {
    if (user.role === 'res') {
      getOrders().then((orders) => {
        const templateVars = {
          orders
        };
        return res.render("restaurant_page", templateVars);
      });
    } else {
      return res.redirect('/');
    }
  });
});

module.exports = router;
