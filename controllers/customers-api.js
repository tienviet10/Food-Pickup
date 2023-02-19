const { placeOrder, getTempReceipt, setReceipt, getACustomerOrders, getOrderDetailsById } = require('../db/queries/orders');
const { getOwnerSMS, setSocketConnection } = require('../db/queries/users');
const { getPaymentsById } = require('../db/queries/payment');
const { paymentIntentNewCard, paymentIntentOldCard, notificationAndGetOrder, getListOfPaymentsFromStripe, addCustomerCards } = require('../helpers/customers');


exports.saveNewSocketConn = (req, res) => {
  setSocketConnection(req.session.user_id, req.body.conn).then((data) => {
    res.json({ message: "Stored socket id for client" });
  }).catch((e) => {
    res.json({ message: "Failed to store socket id" });
  });
};

exports.requestStripePaymentIntent = (req, res) => {
  const info = JSON.parse(req.body.data);
  let clientSecret = '';
  paymentIntentNewCard(req.session.user_id, info.totalPayment).then((paymentIntent) => {
    if (paymentIntent) {
      clientSecret = paymentIntent.client_secret;
      return placeOrder(req.session.user_id, info.finalOrder, clientSecret, info.totalPayment, 'new-card');
    }
    throw 'Payment intent does not exist';
  }).then((order) => {
    if (order && clientSecret) {
      return res.json({ client_secret: clientSecret });
    }
    throw 'Failed to place order!';
  }).catch((e) => {
    console.log(e);
  });
};

exports.payUsingStoredCards = (req, res) => {
  const info = JSON.parse(req.body.data);
  let orderId = '';
  let resOwner = null;
  paymentIntentOldCard(req.session.user_id, info.creditcard, info.totalPayment).then((paymentIntent) => {
    if (paymentIntent) {
      return placeOrder(req.session.user_id, info.finalOrder, paymentIntent.id, info.totalPayment, 'stored-card');
    }
    throw 'Payment intent does not exist';
  }).then((order) => {
    if (order) {
      orderId = order.id;
      return getOwnerSMS(1);
    }
    throw 'Failed to place order!';
  }).then((owner) => {
    if (owner && orderId) {
      resOwner = owner;
      return notificationAndGetOrder(resOwner['phone_number'], orderId);
    }
    throw 'Cannot find restaurant owner';
  }).then((data) => {
    if (data && resOwner) {
      req.io.sockets.to(resOwner['socket_conn']).emit('receive-message', data);
      return res.json({ message: "success" });
    }
    throw 'Failed to retrieve a specific order';
  }).catch((e) => {
    console.log(e);
  });
};

exports.confirmStripePayment = (req, res) => {
  if (req.query.redirect_status === 'succeeded') {
    let cusOrder = null;
    let resOwner = null;
    getTempReceipt(req.query.payment_intent_client_secret).then((order) => {
      if (order) {
        cusOrder = order ;
        return setReceipt(order.id, req.query.payment_intent);
      }
      throw 'No order was found!';
    }).then((sameOrder) => {
      return getOwnerSMS(1);
    }).then((owner) => {
        if (owner && cusOrder) {
          resOwner = owner;
          return notificationAndGetOrder(resOwner['phone_number'], cusOrder.id);
        }
        throw 'Cannot find restaurant owner information';
    }).then((aOrder) => {
      if (aOrder && resOwner) {
        return getListOfPaymentsFromStripe(req.io, resOwner['socket_conn'], aOrder, cusOrder.cus_id);
      }
      throw 'Cannot find the order';
    }).then((cardDetails) => {
      addCustomerCards(cardDetails.data, req.session.user_id);
      return res.redirect('/customers/menu-page');
    }).catch((e) => {
      console.log(e);
    });
  } else {
    res.redirect('/customers/menu-page');
  }
};

exports.getAUserCards = (req, res) => {
  getPaymentsById(req.session.user_id).then((payments) => {
    res.json({ payments });
  }).catch((e) => {
    res.json({ message: "Failed to retrieve payment method!" });
  });
};

exports.getACustomerOrders = (req, res) => {
  getACustomerOrders(req.session.user_id).then((orders) => {
    res.json({ orders });
  }).catch((e) => {
    res.json({ message: "Failed to get orders" });
  });
};

exports.getAOrderDetails = (req, res) => {
  getOrderDetailsById(req.session.user_id, req.body.orderId).then((order) => {
    res.json({ order });
  }).catch((e) => {
    res.json({ message: "Failed to get order details" });
  });
};


