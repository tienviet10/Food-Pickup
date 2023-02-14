const express = require('express');
const router = express.Router();
const { sendTextMessage } = require('../helpers/sms');
const { placeOrder, getSpecificOrder } = require('../db/queries/orders');
const { getOwnerSMS, setSocketConnection } = require('../db/queries/users');


router.post('/place-order', (req, res) => {
  placeOrder(req.session.user_id, req.body).then((order) => {
    if (order) {
      getOwnerSMS(1).then((owner) => {
        sendTextMessage(owner['phone_number'], "NEW ORDER!");

        getSpecificOrder(order.id).then((data) => {
          //console.log(data);

          const cleanOrders = {};
          for (const detail of data) {
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
          console.log(cleanOrders);
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
  // req.io.sockets.emit('receive-message', "hello");
  res.json({ message: "success" });
});

module.exports = router;
