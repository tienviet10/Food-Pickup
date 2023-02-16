const express = require("express");
const router = express.Router();
const { acceptOrder, completeOrder } = require("../db/queries/orders");
const { getUserSMS, setSocketConnection } = require("../db/queries/users");
const { sendTextMessage } = require('../helpers/sms');
const { getOrders, getOrderDetailsByIdRestaurant } = require('../db/queries/orders');

const schedule = require('node-schedule');

router.post("/accept-order", (req, res) => {
  const dateInSecond = req.body.expectedCompletion;
  const orderId = req.body.orderId;
  acceptOrder(dateInSecond, orderId).then((data) => {
    if (data) {
      const expectedCompletion = new Date(dateInSecond * 1000);

      getUserSMS(orderId).then((owner) => {
        req.io.sockets.to(owner['socket_conn']).emit('receive-message', "Order Confirmed!");
        console.log("Set schedule job");
        schedule.scheduleJob(expectedCompletion, () => {
          completeOrder(orderId).then((data) => {
            if (data) {
              sendTextMessage(owner['phone_number'], "Your Order is READY!");

              getUserSMS(orderId).then((owner) => {
                req.io.sockets.to(owner['socket_conn']).emit('receive-message', "Your order is READY!!");
              });
            }
          });
        });
      });

      return res.json({ message: "success" });
    }
  });
});

router.get('/orders', (req, res) => {
  getOrders(4).then((orders) => {
    return res.json({ orders });
  });
});

router.post('/order-details', (req, res) => {
  getOrderDetailsByIdRestaurant(req.body.orderId).then((order) => {
    return res.json({ order });
  });
});


router.post('/conn', (req, res) => {
  setSocketConnection(req.session.user_id, req.body.conn).then((data) => {
    console.log("stored socket id for restaurant");
  });
  res.json({ message: "success" });
});


module.exports = router;
