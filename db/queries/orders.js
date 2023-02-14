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

const getSpecificOrder = (orderId) => {
  return db
    .query(
      "SELECT dishes.name AS dish_name, order_id, quantity, users.name AS customer_name, orders.status AS status FROM orders JOIN order_details ON orders.id = order_id JOIN users ON user_id = users.id JOIN dishes ON dish_id = dishes.id WHERE order_id = $1;", [orderId]
    )
    .then((data) => {
      return data.rows;
    });
};

const placeOrder = (userId, orders) => {
  return db
    .query(
      "INSERT INTO orders (user_id, restaurant_id, expected_completion, status) VALUES ($1, 1, NULL, 'pending') RETURNING *;",
      [userId]
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
      // TODO: transactions in SQL server (Postgres transaction)
    });
};

const acceptOrder = (expectedCompletion, orderId) => {
  return db
    .query(
      `UPDATE orders SET expected_completion = to_timestamp($1), status = 'in progress' WHERE id = $2
       RETURNING *;`,
      [expectedCompletion, orderId]
    )
    .then((data) => {
      return data.rows[0];
    });
};
const completeOrder = (orderId) => {
  return db
    .query(
      `UPDATE orders SET status = 'completed' WHERE id = $1
     RETURNING *;`,
      [orderId]
    )
    .then((data) => {
      return data.rows[0];
    });
};
module.exports = { getOrders, placeOrder, acceptOrder, completeOrder, getSpecificOrder };
