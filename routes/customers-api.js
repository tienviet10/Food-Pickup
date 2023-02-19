const express = require('express');
const router = express.Router();

const { saveNewSocketConn, requestStripePaymentIntent, confirmStripePayment, getAUserCards, payUsingStoredCards, getACustomerOrders, getAOrderDetails } = require('../controllers/customers-api');


router.post('/conn', saveNewSocketConn);

router.post('/request-payment', requestStripePaymentIntent);

router.get('/stripe-info', confirmStripePayment);

router.get('/payment-methods', getAUserCards);

router.post('/stored-cards-payment', payUsingStoredCards);

router.get('/orders', getACustomerOrders);

router.post('/order-details', getAOrderDetails);


module.exports = router;
