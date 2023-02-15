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

const placeOrder = (userId, orders, receiptId, totalAmount) => {
  return db
    .query(
      "INSERT INTO orders (user_id, restaurant_id, expected_completion, status, receipt_id, total_payment) VALUES ($1, 1, NULL, 'pending', $2, $3) RETURNING *;",
      [userId, receiptId, totalAmount]
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

const setReceipt = (orderId, receipt) => {
  return db
    .query(
      `UPDATE orders SET receipt_id = $1 WHERE id = $2
     RETURNING *;`,
      [receipt, orderId]
    )
    .then((data) => {
      return data.rows[0];
    });
};

const getTempReceipt = (receiptId) => {
  return db
    .query(
      `SELECT orders.id, users.cus_id FROM orders JOIN users ON user_id = users.id WHERE receipt_id = $1
     `,
      [receiptId]
    )
    .then((data) => {
      return data.rows[0];
    });
};

const getACustomersOrders = (customerId) => {
  return db
    .query(
      "SELECT orders.id, restaurants.name, expected_completion, status, total_payment, order_date FROM orders JOIN restaurants ON restaurants.id = restaurant_id WHERE user_id = $1", [customerId]
    )
    .then((data) => {
      return data.rows;
    });
};

const getOrderDetailsById = (customerId, orderId) => {
  // return db
  //   .query(
  //     "SELECT * FROM orders JOIN order_details ON orders.id = order_id WHERE user_id = $1 AND orders.id = $2", [customerId, orderId]
  //   )
  //   .then((data) => {
  //     return data.rows;
  //   });
  return db
    .query(
      "SELECT dishes.name AS dish_name, order_id, quantity, dishes.price FROM orders JOIN order_details ON orders.id = order_id JOIN users ON user_id = users.id JOIN dishes ON dish_id = dishes.id WHERE users.id = $1 AND orders.id = $2;", [customerId, orderId]
    )
    .then((data) => {
      return data.rows;
    });
};


module.exports = { getOrders, placeOrder, acceptOrder, completeOrder, getSpecificOrder, setReceipt, getTempReceipt, getACustomersOrders, getOrderDetailsById };
