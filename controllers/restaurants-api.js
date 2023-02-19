const { acceptOrder } = require("../db/queries/orders");
const { getUserSMS, setSocketConnection } = require("../db/queries/users");
const { getOrders, getOrderDetailsByIdRestaurant } = require('../db/queries/orders');
const { setCronSchedule } = require('../helpers/restaurants');

exports.acceptANewOrder = (req, res) => {
  const dateInSecond = req.body.expectedCompletion;
  const expectedCompletion = new Date(dateInSecond * 1000);
  const orderId = req.body.orderId;
  acceptOrder(dateInSecond, orderId).then((data) => {
    if (data) {
      return getUserSMS(orderId);
    }
    throw 'Accept Order failed!';
  }).then((owner) => {
    setCronSchedule(req.io, orderId, owner, expectedCompletion);
    res.json({ message: "success" });
  }).catch((e) => {
    console.log(e);
  });
};

exports.getAllRestaurantOrders = (req, res) => {
  getOrders(4).then((orders) => {
    res.json({ orders });
  }).catch((e) => {
    res.json({ message: "Failed to get orders" });
  });
};

exports.getAOrderDetails = (req, res) => {
  getOrderDetailsByIdRestaurant(req.body.orderId).then((order) => {
    res.json({ order });
  }).catch((e) => {
    res.json({ message: "Failed to get order details" });
  });
};

exports.storeANewSocketConn = (req, res) => {
  setSocketConnection(req.session.user_id, req.body.conn).then((data) => {
    res.json({ message: "Stored socket id for restaurant" });
  }).catch((e) => {
    res.json({ message: "Failed to store socket id" });
  });
};
