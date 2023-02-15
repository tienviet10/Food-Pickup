const express = require("express");
const router = express.Router();

router.get("/restaurant-order", (req, res) => {
  res.render("restaurant_page");
});

module.exports = router;
