const db = require("../connection");

const getRestaurantAndMenuInfo = () => {
  return db
    .query(
      "SELECT restaurants.*, dishes.id, dishes.name as dish_name, dishes.price, dishes.description, dishes.url FROM restaurants JOIN dishes ON restaurants.id = restaurant_id WHERE dishes.active = TRUE;"
    )
    .then((data) => {
      return data.rows;
    });
};

module.exports = { getRestaurantAndMenuInfo };
