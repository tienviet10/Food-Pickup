const { getUserById } = require('../db/queries/users');

const auth = (role, io) => {
  return (req, res, next) => {
    getUserById(req.session.user_id).then((data) => {
      if (data && data.role === role) {
        req.io = io;
        next();
      } else {
        res.redirect('/');
      }
    });
  };
};

module.exports = { auth };
