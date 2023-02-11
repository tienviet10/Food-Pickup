const db = require('../connection');

const getUsers = () => {
  return db.query('SELECT * FROM users;')
    .then(data => {
      return data.rows;
    });
};

const getUserPassword = (email) => {
  return db.query('SELECT * FROM users WHERE email = $1;', [email])
    .then(data => {
      return data.rows[0] || {};
    });
};

const getRestaurantOwnerPassword = (email) => {
  return db.query('SELECT * FROM restaurant_owners WHERE email = $1;', [email])
    .then(data => {
      return data.rows[0] || {};
    });
};

const checkIdCustomer = (id) => {
  return db.query('SELECT * FROM users WHERE id = $1;', [id])
    .then(data => {
      return data.rows[0];
    });
};

const checkIdOwner = (id) => {
  return db.query('SELECT * FROM restaurant_owners WHERE id = $1;', [id])
    .then(data => {
      return data.rows[0];
    });
};


module.exports = { getUsers, getUserPassword, getRestaurantOwnerPassword, checkIdCustomer, checkIdOwner };
