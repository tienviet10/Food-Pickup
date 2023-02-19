
exports.returnHomePage = (req, res) => {
  if (!req.role) {
    req.session = null;
  }
  const templateVar = { user: false };
  return res.render('home_page', templateVar);
};
