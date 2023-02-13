const express = require('express');
const router = express.Router();
const { sendTextMessage } = require('../helpers/sms');
const { placeOrder } = require('../db/queries/orders');
const {getOwnerSMS } = require('../db/queries/users');

router.post('/place-order', (req, res) => {
  placeOrder(req.session.user_id, req.body).then((data) => {
    if (data) {
      getOwnerSMS(1).then((owner) => {
        sendTextMessage(owner['phone_number'], "NEW ORDER!");
      });

      return res.json({ message: "success" });
    }
  });
});

module.exports = router;
