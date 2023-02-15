const db = require("../connection");

const savePaymentInfo = (userId, paymentMethod, last4) => {
  return db
    .query(
      "SELECT last4 FROM payment WHERE user_id = $1 AND last4 = $2", [userId, last4]
    )
    .then((data) => {

      if (data.rowCount === 0) {
        return db
          .query(
            "INSERT INTO payment (user_id, payment_method, last4) VALUES ($1, $2, $3) RETURNING *;", [userId, paymentMethod, last4]
          )
          .then((data) => {
            return data.rows[0];
          });
      }
      return null;
    });
};

const getPaymentsById = (userId) => {
  return db
    .query(
      "SELECT id, last4 FROM payment WHERE user_id = $1", [userId]
    )
    .then((data) => {
      return data.rows;
    });
};

const getAPaymentById = (userId, paymentId) => {
  return db
    .query(
      "SELECT users.cus_id, payment_method FROM payment JOIN users ON user_id = users.id WHERE user_id = $1 AND payment.id = $2", [userId, paymentId]
    )
    .then((data) => {
      return data.rows[0];
    });
};

module.exports = { savePaymentInfo, getPaymentsById, getAPaymentById };
