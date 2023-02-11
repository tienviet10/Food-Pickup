const db = require('../connection');

const getOrders = () => {
  return db.query('SELECT dishes.name AS dish_name, order_id, quantity, users.name AS customer_name FROM orders JOIN order_details ON orders.id = order_id JOIN users ON user_id = users.id JOIN dishes ON dish_id = dishes.id ;')
    .then(data => {
      return data.rows;
    });
};
module.exports = { getOrders };
