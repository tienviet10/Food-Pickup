const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const sendTextMessage = (phone, description) => {
  client.messages
    .create({
      to: phone,
      from: '+13656045964',
      body: description,
    })
    .then((message) => console.log(`Message SID ${message.sid}`))
    .catch((error) => console.error(error));
};

module.exports = { sendTextMessage };
