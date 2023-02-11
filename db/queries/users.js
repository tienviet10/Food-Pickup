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


module.exports = { getUsers, getUserByEmail, getUserById, addNewUser };
