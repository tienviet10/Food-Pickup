const express = require('express');
const router  = express.Router();

const { placeOrder } = require('../db/queries/orders');
router.post('/place-order', (req, res) => {

  placeOrder(req.session.user_id, req.body).then((data)=>{
    if (data) {
      return res.json({message: "success"});
    }
  });

  // .then((restaurant) => {
  //   const templateVar = { restaurant };
  //   return res.render('main_page', templateVar);
  // });
});

module.exports = router;
