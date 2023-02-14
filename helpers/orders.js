
const orderProcessing = (orderData) => {
  const cleanOrders = {};
  for (const detail of orderData) {
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
  return cleanOrders;
};

module.exports = { orderProcessing };
