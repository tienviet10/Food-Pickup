const { addANewUserDatabase } = require("../db/queries/users");

const addANewUser = (info, hashPassword, stripeCusId) => {
  return addANewUserDatabase(info.name, info.email, hashPassword, info.phone, stripeCusId);
};

module.exports = { addANewUser };
