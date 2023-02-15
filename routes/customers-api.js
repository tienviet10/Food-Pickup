const express = require('express');
const router = express.Router();
const { sendTextMessage } = require('../helpers/sms');
const { orderProcessing } = require('../helpers/orders');
const { placeOrder, getSpecificOrder, getTempReceipt, setReceipt } = require('../db/queries/orders');
const { getOwnerSMS, setSocketConnection, getUserById } = require('../db/queries/users');
const { savePaymentInfo, getPaymentsById, getAPaymentById } = require('../db/queries/payment');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

// router.post('/place-order', (req, res) => {
//   placeOrder(req.session.user_id, req.body).then((order) => {
//     if (order) {
//       getOwnerSMS(1).then((owner) => {
//         sendTextMessage(owner['phone_number'], "NEW ORDER!");

//         getSpecificOrder(order.id).then((data) => {
//           const cleanOrders = orderProcessing(data);
//           req.io.sockets.to(owner['socket_conn']).emit('receive-message', cleanOrders);
//         });
//       });

//       return res.json({ message: "success" });
//     }
//   });
// });


router.post('/conn', (req, res) => {
  setSocketConnection(req.session.user_id, req.body.conn).then((data) => {
    console.log("stored socket id for client");
  });
  res.json({ message: "success" });
});

router.post('/request-payment', (req, res) => {
  const info = JSON.parse(req.body.data);
  console.log(Math.round(info.totalPayment * 100));

  getUserById(req.session.user_id).then((user) => {
    stripe.paymentIntents.create({
      customer: user.cus_id,
      "setup_future_usage": 'off_session',
      amount: Math.round(info.totalPayment * 100),
      currency: 'cad',
      "automatic_payment_methods": {
        enabled: true,
      },
    }).then((paymentIntent) => {
      placeOrder(req.session.user_id, info.finalOrder, paymentIntent.client_secret, info.totalPayment).then((order) => {
        if (order) {
          return res.json({ client_secret: paymentIntent.client_secret });
        }
      });
    });
  });
});

router.get('/stripe-info', (req, res) => {
  if (req.query.redirect_status === 'succeeded') {
    return getTempReceipt(req.query.payment_intent_client_secret).then((order) => {
      setReceipt(order.id, req.query.payment_intent).then((sameOrder) => {
        getOwnerSMS(1).then((owner) => {
          sendTextMessage(owner['phone_number'], "NEW ORDER!");
          getSpecificOrder(sameOrder.id).then((data) => {
            const cleanOrders = orderProcessing(data);
            req.io.sockets.to(owner['socket_conn']).emit('receive-message', cleanOrders);
            stripe.paymentMethods.list({
              customer: `${order.cus_id}`,
              type: 'card',
            }).then((details) => {
              for (const card of details.data) {
                savePaymentInfo(req.session.user_id, card.id, card.card.last4);
              }
            });
            //res.json({ message: "success" });
            res.redirect('/customers/menu-page');
          });
        });
      });
    });
  }
  res.redirect('/customers/menu-page');
});

router.get('/payment-methods', (req, res) => {
  getPaymentsById(req.session.user_id).then((payments) => {
    return res.json({ payments });
  });
});

router.post('/stored-cards-payment', (req, res) => {
  const info = JSON.parse(req.body.data);
  getAPaymentById(req.session.user_id, info.creditcard).then((payment) => {
    stripe.paymentIntents.create({
      amount: Math.round(info.totalPayment * 100),
      currency: 'usd',
      customer: payment.cus_id,
      payment_method: payment.payment_method,
      off_session: true,
      confirm: true,
    }).then((paymentIntent) => {
      placeOrder(req.session.user_id, info.finalOrder, paymentIntent.id, info.totalPayment).then((order) => {
        if (order) {
          getOwnerSMS(1).then((owner) => {
            sendTextMessage(owner['phone_number'], "NEW ORDER!");
            getSpecificOrder(order.id).then((data) => {
              const cleanOrders = orderProcessing(data);
              req.io.sockets.to(owner['socket_conn']).emit('receive-message', cleanOrders);
              //setReceipt(order.id, paymentIntent.id);
              return res.json({ message: "success" });
            });
          });
        }
      });

    });
  });



});


module.exports = router;
