const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const sendTextMessage = (phone, description) => {
  return client.messages
    .create({
      to: phone,
      from: process.env.TWILIO_PHONE,
      body: description,
    })
    .then((message) => console.log(`Message SID ${message.sid}`));
};

module.exports = { sendTextMessage };
