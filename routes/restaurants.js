const express = require("express");
const router = express.Router();
const { getOrders } = require("../db/queries/orders");
const { getUserById } = require("../db/queries/users");

router.get("/restaurant-order", (req, res) => {
  getUserById(req.session.user_id).then((user) => {
    if (user.role === "res") {
      getOrders().then((orders) => {

        const cleanOrders = {};
        for (const detail of orders) {
          if (cleanOrders[detail.order_id]) {
            cleanOrders[detail.order_id]["dishes"].push([
              detail["dish_name"],
              detail["quantity"],
            ]);
          } else {
            cleanOrders[detail.order_id] = {
              order_id: detail.order_id,
              customer_name: detail.customer_name,
              dishes: [[detail["dish_name"], detail["quantity"]]],
              status: detail["status"],
            };
          }
        }

        const templateVars = {
          cleanOrders,
        };

        // const newObj = {
        //   1: {
        //     order_id: 1,
        //     customer_name: "Viet",
        //     dishes: [["pasta",3], ["steak", 5]]
        //   },
        //   2: {
        //     order_id: 2,
        //     customer_name: "Alex",
        //     dishes: [["pasta",3], ["steak", 5]]
        //   }
        // }

        return res.render("restaurant_page", templateVars);
      });
    } else {
      return res.redirect("/");
    }
  });
});

module.exports = router;
