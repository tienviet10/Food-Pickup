const express = require("express");
const router = express.Router();


//// CHANGE THIS ROUTE TO /API/
router.get("/restaurant-order", (req, res) => {
  res.render("restaurant_page");
});

module.exports = router;
