const db = require("../connection");

const getOrders = () => {
  return db
    .query(
      "SELECT dishes.name AS dish_name, order_id, quantity, users.name AS customer_name, orders.status AS status FROM orders JOIN order_details ON orders.id = order_id JOIN users ON user_id = users.id JOIN dishes ON dish_id = dishes.id;"
    )
    .then((data) => {
      return data.rows;
    });
};

const placeOrder = (user_id, orders) => {
  return db
    .query(
      "INSERT INTO orders (user_id, restaurant_id, expected_completion, status) VALUES ($1, 1, NULL, 'pending') RETURNING *;",
      [user_id]
    )
    .then((data) => {
      for (const item in orders) {
        db.query(
          "INSERT INTO order_details (order_id, dish_id, quantity) VALUES ($1, $2, $3) RETURNING *;",
          [data.rows[0].id, item, orders[item]]
        );
      }
      return data.rows[0];
      // data.rows[0].id;
    });
};

const acceptOrder = (expected_completion, order_id) => {
  return db
    .query(
      `UPDATE orders SET expected_completion = to_timestamp($1), status = 'in progress' WHERE id = $2
       RETURNING *;`,
      [expected_completion, order_id]
    )
    .then((data) => {
      return data.rows[0];
    });
};
const completeOrder = (order_id) => {
  return db
    .query(
      `UPDATE orders SET status = 'completion' WHERE id = $1
     RETURNING *;`,
      [order_id]
    )
    .then((data) => {
      return data.rows[0];
    });
};
module.exports = { getOrders, placeOrder, acceptOrder, completeOrder };
