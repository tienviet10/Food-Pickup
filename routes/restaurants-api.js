const express = require("express");
const router = express.Router();
const { acceptOrder, completeOrder } = require("../db/queries/orders");
const { getUserSMS, setSocketConnection } = require("../db/queries/users");
const { sendTextMessage } = require('../helpers/sms');
const { getOrders } = require('../db/queries/orders');
const { getUserById } = require('../db/queries/users');
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
              // getUserSMS(orderId).then((owner) => {
              //   sendTextMessage(owner['phone_number'], "Your Order is READY!");
              // });
              sendTextMessage(owner['phone_number'], "Your Order is READY!");
            }
          });
        });
      });

      return res.json({ message: "success" });
    }
  });
});

router.get('/orders', (req, res) => {
  getUserById(req.session.user_id).then((user) => {
    if (user.role === "res") {
      getOrders().then((orders) => {
        const cleanOrders = {};
        for (const detail of orders) {
          if (cleanOrders[detail.order_id]) {
            cleanOrders[detail.order_id]["dishes"].push([
              detail["dish_name"],
              detail["quantity"],
            ]);
          } else {
            cleanOrders[detail.order_id] = {
              order_id: detail.order_id,
              customer_name: detail.customer_name,
              dishes: [[detail["dish_name"], detail["quantity"]]],
              status: detail["status"],
            };
          }
        }

        return res.json({ cleanOrders });
      });
    } else {
      return res.redirect("/");
    }
  });
});

router.post('/conn', (req, res) => {

  setSocketConnection(req.session.user_id, req.body.conn).then((data) => {
    console.log("stored socket id for restaurant");
  });
  // req.io.sockets.emit('receive-message', "hello");
  res.json({ message: "success" });
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
