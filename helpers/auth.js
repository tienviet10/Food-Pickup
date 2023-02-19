const { getUserById, getUserByEmail } = require('../db/queries/users');

const auth = (role, io) => {
  return (req, res, next) => {
    getUserById(req.session.user_id).then((data) => {
      if (data && data.role === role) {
        req.io = io;
        next();
      } else {
        req.session = null;
        res.redirect('/');
      }
    }).catch((e)=>{
      res.redirect('/');
    });
  };
};

const roleValidate = (req, res, next) => {
  getUserById(req.session.user_id).then((user) => {
    if (user && user.role) {
      req.role = user.role;
    }
    next();
  }).catch((e)=>{
    res.json({ error: "Error in database request!" })
  });
};

const validateUserEmail = (req, res, next) => {
  getUserByEmail(req.body.email).then((user) => {
    if (user){
      req.user = user;
    }
    next();
  }).catch((err) => {
    res.json({ error: "Error in database request!" })
  });
};


module.exports = { auth, roleValidate, validateUserEmail };
