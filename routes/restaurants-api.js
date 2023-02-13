const express = require("express");
const router = express.Router();
const { acceptOrder, completeOrder } = require("../db/queries/orders");
const { getUserSMS } = require("../db/queries/users");
const { sendTextMessage } = require('../helpers/sms');

router.post("/accept-order", (req, res) => {
  acceptOrder(req.body.expected_completion, req.body.order_id).then((data) => {
    if (data) {
      return res.json({ message: "success" });
    }
  });
});

router.post("/complete-order", (req, res) => {
  const orderId = req.body['order_id'];
  completeOrder(orderId).then((data) => {
    if (data) {
      getUserSMS(orderId).then((owner) => {
        sendTextMessage(owner['phone_number'], "Your Order is READY!");
      });
      return res.json({ message: "success" });
    }
  });
});

module.exports = router;
