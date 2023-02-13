const express = require("express");
const router = express.Router();
const { acceptOrder, completeOrder } = require("../db/queries/orders");
const { getUserSMS } = require("../db/queries/users");
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console
const client = require('twilio')(accountSid, authToken);

router.post("/accept-order", (req, res) => {
  acceptOrder(req.body.expected_completion, req.body.order_id).then((data) => {
    if (data) {
      return res.json({ message: "success" });
    }
  });
});
router.post("/complete-order", (req, res) => {
  console.log(req.body);
  const orderId = req.body['order_id'];
  completeOrder(orderId).then((data) => {
    if (data) {
      const sendTextMessage = (phone) => {
        console.log(phone);
        client.messages
          .create({
            to: phone,
            from: '+15704735162',
            body: 'Hello Node!',
          })
          .then((message) => console.log(`Message SID ${message.sid}`))
          .catch((error) => console.error(error));
      };

      getUserSMS(orderId).then((owner) => {
        sendTextMessage(owner['phone_number']);
      });
      return res.json({ message: "success" });
    }
  });
});

module.exports = router;
