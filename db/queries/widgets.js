const db = require('../connection');

const getWidget = () => {
  const query = `SELECT * FROM widgets`;
  return db.query(query);
};

const makeWidget = () => {
  console.log("first");
};

module.exports = { getWidget, makeWidget };
