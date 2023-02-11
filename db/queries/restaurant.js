const db = require('../connection');

const getRestaurantInfo = () => {
  return db.query('SELECT * FROM restaurants;')
    .then(data => {
      return data.rows[0];
    });
};



module.exports = { getRestaurantInfo };
