const { getRestaurantAndMenuInfo } = require('../db/queries/restaurant.js');

exports.returnMenuPage = (req, res) => {
  getRestaurantAndMenuInfo().then((restaurant) => {
    const templateVar = { restaurant, user: true };
    return res.render('main_page', templateVar);
  });
};

exports.returnOrdersPage = (req, res) => {
  const templateVar = { user: true };
  res.render('customer_orders', templateVar);
};
