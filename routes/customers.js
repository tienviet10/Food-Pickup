const express = require('express');
const router  = express.Router();
const { returnMenuPage, returnOrdersPage } = require('../controllers/customers.js');

router.get('/menu-page', returnMenuPage);

router.get('/orders-page', returnOrdersPage);

module.exports = router;
