const express = require("express");
const router = express.Router();
const { acceptANewOrder, getAllRestaurantOrders, getAOrderDetails, storeANewSocketConn } = require("../controllers/restaurants-api");

router.get('/orders', getAllRestaurantOrders);

router.post("/accept-order", acceptANewOrder);

router.post('/order-details', getAOrderDetails);

router.post('/conn', storeANewSocketConn);

module.exports = router;
