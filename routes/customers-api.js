const express = require('express');
const router = express.Router();
const { sendTextMessage } = require('../helpers/sms');
const { orderProcessing } = require('../helpers/orders');
const { placeOrder, getSpecificOrder } = require('../db/queries/orders');
const { getOwnerSMS, setSocketConnection } = require('../db/queries/users');


router.post('/place-order', (req, res) => {
  placeOrder(req.session.user_id, req.body).then((order) => {
    if (order) {
      getOwnerSMS(1).then((owner) => {
        sendTextMessage(owner['phone_number'], "NEW ORDER!");

        getSpecificOrder(order.id).then((data) => {
          const cleanOrders = orderProcessing(data);
          req.io.sockets.to(owner['socket_conn']).emit('receive-message', cleanOrders);
        });
      });

      return res.json({ message: "success" });
    }
  });
});


router.post('/conn', (req, res) => {
  setSocketConnection(req.session.user_id, req.body.conn).then((data) => {
    console.log("stored socket id for client");
  });
  res.json({ message: "success" });
});

module.exports = router;
