const db = require("../connection");

const getRestaurantAndMenuInfo = () => {
  return db
    .query(
      "SELECT restaurants.*, dishes.name as dish_name, dishes.price, dishes.description FROM restaurants JOIN dishes ON restaurants.id = restaurant_id;"
    )
    .then((data) => {
      return data.rows;
    });
};

module.exports = { getRestaurantAndMenuInfo };
