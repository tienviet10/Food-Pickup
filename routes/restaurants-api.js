const express = require("express");
const router = express.Router();
const { acceptOrder, completeOrder } = require("../db/queries/orders");
const { getUserSMS } = require("../db/queries/users");
const { sendTextMessage } = require('../helpers/sms');
const schedule = require('node-schedule');

router.post("/accept-order", (req, res) => {
  const dateInSecond = req.body.expected_completion;
  const orderId = req.body.orderId;
  acceptOrder(dateInSecond, orderId).then((data) => {
    if (data) {
      const newDate = new Date(dateInSecond * 1000);
      console.log(newDate);
      schedule.scheduleJob(newDate, ()=>{
        completeOrder(orderId).then((data) => {
          if (data) {
            getUserSMS(orderId).then((owner) => {
              sendTextMessage(owner['phone_number'], "Your Order is READY!");
            });
          }
        });
      });
      return res.json({ message: "success" });
    }
  });
});

// router.post("/complete-order", (req, res) => {
//   const orderId = req.body['order_id'];
//   completeOrder(orderId).then((data) => {
//     if (data) {
//       getUserSMS(orderId).then((owner) => {
//         sendTextMessage(owner['phone_number'], "Your Order is READY!");
//       });
//       return res.json({ message: "success" });
//     }
//   });
// });

module.exports = router;
