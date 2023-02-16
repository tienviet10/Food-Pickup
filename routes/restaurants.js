const express = require("express");
const router = express.Router();

router.get("/restaurant-order", (req, res) => {
  const templateVar = { user: true };
  res.render("restaurant_page", templateVar);
});

module.exports = router;
