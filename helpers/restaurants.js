const { completeOrder } = require("../db/queries/orders");
const { getUserSMS } = require("../db/queries/users");
const { sendTextMessage } = require("./sms");
const schedule = require('node-schedule');

const sendNotificationToOwner = (orderId, io) => {
  return getUserSMS(orderId).then((owner) => {
    if (owner) {
      io.sockets.to(owner['socket_conn']).emit('receive-message', "Your food is now ready for pick up!");
      return sendTextMessage(owner['phone_number'], "Your order is ready for pickup. Thank you for choosing FoodWise!");
    }
    throw "Failed to get user's information";
  });
};

const scheduleCronTask = (orderId, io) => {
  return completeOrder(orderId).then((data) => {
    if (data) {
      return sendNotificationToOwner(orderId, io);
    }
    throw 'Error in completing order!';
  });
};

const setCronSchedule = (io, orderId, owner, expectedCompletion) => {
  io.sockets.to(owner['socket_conn']).emit('receive-message', "Your order has been confirmed!");
  schedule.scheduleJob(expectedCompletion, () => {
    scheduleCronTask(orderId, io).catch((e) => {
      console.log(e);
    });
  });
};


module.exports = { setCronSchedule };
