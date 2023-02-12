// Client facing scripts here
$(() => {
  let foodCart = {};
  $(".add-cart-btn").on("click", (event) => {
    const targetFood = event.target.dataset;
    if (foodCart[targetFood.id]) {
      foodCart[targetFood.id].quantity++;
    } else {
      foodCart[targetFood.id] = {
        quantity: 1,
        name: targetFood.name,
        price: targetFood.price,
      };
    }
  });

  $("#cart-btn").on("click", function () {
    const cartBody = $(".table-body");
    cartBody.empty();
    let total = 0;

    for (const food_id in foodCart) {
      const thisDishTotal =
        Number(foodCart[food_id].quantity) * Number(foodCart[food_id].price);
      cartBody.append(`
      <tr>
        <td>
          <div class="media align-items-center">
            <div class="media-body">
              <a href="#" class="d-block text-dark">${foodCart[food_id].name}</a>
            </div>
          </div>
        </td>
        <td class="text-right font-weight-semibold align-middle">$${foodCart[food_id].price}</td>
        <td class="align-middle">${foodCart[food_id].quantity}</td>
        <td class="text-right font-weight-semibold align-middle">$${thisDishTotal}</td>
      </tr>
      `);
      total += thisDishTotal;
    }

    $(".cart-total").empty().append(`
      <strong>$${(total * 1.13).toFixed(2)}</strong>
    `);
  });

  $("#place-order").on("click", (event) => {
    const finalOrder = {};
    for (const dishId in foodCart) {
      finalOrder[dishId] = foodCart[dishId].quantity;
    }

    console.log(finalOrder);
    $.post("/api/customers/place-order", finalOrder, function (data, status) {
      foodCart = {};
      $("#close-modal").click();
    });
  });
});
