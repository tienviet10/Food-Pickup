
exports.returnRestaurantPage = (req, res) => {
  const templateVar = { user: true };
  res.render("restaurant_page", templateVar);
};
