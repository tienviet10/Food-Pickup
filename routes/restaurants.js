const express = require("express");
const router = express.Router();
const { returnRestaurantPage } = require("../controllers/restaurants");

router.get("/restaurant-order", returnRestaurantPage);

module.exports = router;
