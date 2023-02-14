const db = require('../connection');

const getUsers = () => {
  return db.query('SELECT * FROM users;')
    .then(data => {
      return data.rows;
    });
};

const getUserByEmail = (email) => {
  return db.query('SELECT * FROM users WHERE email = $1;', [email])
    .then(data => {
      return data.rows[0];
    });
};


const getUserById = (id) => {
  return db.query('SELECT * FROM users WHERE id = $1;', [id])
    .then(data => {
      return data.rows[0];
    });
};

const addNewUser = (name, email, password, phone_number) => {
  return db.query(`INSERT INTO users (name, email, password, phone_number, role)
VALUES ($1, $2, $3, $4, 'cus')
RETURNING * ; `, [name, email, password, phone_number])
    .then(data => {
      return data.rows[0];
    });
};

const setSocketConnection = (userId, conn) => {
  return db.query(`UPDATE users SET socket_conn = $1 WHERE id = $2
RETURNING * ; `, [conn, userId])
    .then(data => {
      return data.rows[0];
    });
};

const getOwnerSMS = (restaurant_id) => {
  return db.query(`
SELECT users.phone_number, users.socket_conn From users JOIN restaurants ON restaurants.owner_id = users.id WHERE restaurants.id = $1;
`, [restaurant_id])
    .then(data => {
      return data.rows[0];
    });

};

const getUserSMS = (ordersId) => {
  return db.query(`
SELECT users.phone_number, users.socket_conn From users JOIN orders ON user_id = users.id WHERE orders.id = $1;
`, [ordersId])
    .then(data => {
      return data.rows[0];
    });

};


module.exports = { getUsers, getUserByEmail, getUserById, addNewUser, getOwnerSMS, getUserSMS, setSocketConnection };
