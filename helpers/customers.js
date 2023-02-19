const { sendTextMessage } = require('../helpers/sms');
const { getSpecificOrder } = require('../db/queries/orders');
const { getUserById } = require('../db/queries/users');
const { savePaymentInfo, getAPaymentById } = require('../db/queries/payment');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

const paymentIntentNewCard = (userId, total) => {
  return getUserById(userId).then((user) => {
    if (user) {
      return stripe.paymentIntents.create({
        customer: user.cus_id,
        "setup_future_usage": 'off_session',
        amount: Math.round(total * 100),
        currency: 'cad',
        "automatic_payment_methods": {
          enabled: true,
        },
      });
    }
    throw 'User does not exist';
  })
}

const paymentIntentOldCard = (userId, creditcard, total) => {
  return getAPaymentById(userId, creditcard).then((payment) => {
    if (payment) {
      return stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: 'cad',
        customer: payment.cus_id,
        payment_method: payment.payment_method,
        off_session: true,
        confirm: true,
      });
    }
    throw 'Payment does not exist';
  })
}

const notificationAndGetOrder = (phone, orderId) => {
  sendTextMessage(phone, "You have received a new order!");
  return getSpecificOrder(orderId);
}

const getListOfPaymentsFromStripe = (io, socketConn, aOrder, cusId) => {
  io.sockets.to(socketConn).emit('receive-message', aOrder);
  return stripe.paymentMethods.list({
    customer: cusId,
    type: 'card',
  });
}

const addCustomerCards = (cardDetails, userId) => {
  for (const card of cardDetails) {
    savePaymentInfo(userId, card.id, card.card.last4);
  }
}


module.exports = { paymentIntentNewCard, paymentIntentOldCard, notificationAndGetOrder, getListOfPaymentsFromStripe, addCustomerCards };
