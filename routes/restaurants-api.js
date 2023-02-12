const express = require("express");
const router = express.Router();
const { acceptOrder } = require("../db/queries/orders")

router.post("/accept-order", (req, res) => {
  acceptOrder(req.body.expected_completion, req.body.order_id).then((data)=>{
    if (data) {
      return res.json({message: "success"});
    }
});
});

module.exports = router;
