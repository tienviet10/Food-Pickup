const express = require('express');
const router = express.Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console
const client = require('twilio')(accountSid, authToken);

const { placeOrder } = require('../db/queries/orders');
const {getOwnerSMS } = require('../db/queries/users');

router.post('/place-order', (req, res) => {

  placeOrder(req.session.user_id, req.body).then((data) => {
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

      getOwnerSMS(1).then((owner) => {
        sendTextMessage(owner['phone_number']);
      });

      return res.json({ message: "success" });
    }
  });


});

module.exports = router;
