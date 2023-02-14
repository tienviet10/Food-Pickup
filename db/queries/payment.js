const db = require("../connection");

const savePaymentInfo = (userId, paymentMethod, last4) => {
  return db
    .query(
      "SELECT last4 FROM payment WHERE user_id = $1 AND last4 = $2", [userId, last4]
    )
    .then((data) => {
      console.log(data.rowCount === 0);
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

module.exports = { savePaymentInfo };
