// Attach to each order that have expected completion date in the future
const timer = (date, $ele1, $ele2) => {
  const countDownDate = new Date(date).getTime();

  const runTimer = () => {
    const now = new Date().getTime();
    const distance = countDownDate - now;
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.ceil((distance % (1000 * 60 * 60)) / (1000 * 60));
    if (distance < 0) {
      $ele1.text(0 + "h " + 0 + "m ");
      $ele2.empty().append(`<span class="status text-success">&bull;</span> completed`);
    } else {
      $ele1.text(hours + "h " + minutes + "m ");
      $ele2.empty().append(`<span class="status text-danger">&bull;</span> in progress`);
    }
    return distance;
  };
  runTimer();

  const x = setInterval(function() {
    let distance = runTimer();
    if (distance < 0) {
      clearInterval(x);
    }
  }, 30000);
};

// Attach to each order to display as a row in a table
const rowTemplate = (orderId, name, countDown, status, totalPayment, orderDate) => {
  const convertedDate = new Date(orderDate).toString();
  return $(`
  <tr>
    <td id='row_${orderId}' data-toggle="modal" data-target="#exampleModalCenter" >${orderId}</td>
    <td>${name}</td>
    <td class='timer'>${countDown}</td>
    <td><span class="status">&bull;</span> ${status}</td>
    <td>$${totalPayment}</td>
    <td>${convertedDate.substring(0, convertedDate.lastIndexOf(':'))}</td>
    <td><a class='details-btn' title="View Details" data-toggle="modal" data-target="#exampleModalCenter" ><i class="material-icons">&#xE5C8;</i></a>
    </td>
  </tr>
`);
};

// Retrieve details for an order
const retrieveOrderDetail = (orderId, role) => {
  $.post(`/api/${role}/order-details`, { orderId }).then(data => {
    createDetailTable(data.order);
  });
};

const createDetailTable = (foodCart) => {
  const cartBody = $(".table-body");
  cartBody.empty();
  let total = 0;
  let totalPayment = 0;
  for (const food of foodCart) {
    const thisDishTotal =
      Number(food.quantity) * Number(food.price);
    cartBody.append(`
    <tr>
      <td>
        <div class="media align-items-center">
          <div class="media-body">
            <a href="#" class="d-block text-dark">${food.dish_name}</a>
          </div>
        </div>
      </td>
      <td class="text-right font-weight-semibold align-middle">$${food.price}</td>
      <td class="align-middle">${food.quantity}</td>
      <td class="text-right font-weight-semibold align-middle">$${thisDishTotal}</td>
    </tr>
    `);
    total += thisDishTotal;
  }
  totalPayment = Math.round(total * 1.13 * 100) / 100;
  $(".cart-total").empty().append(`
    <strong>$${totalPayment}</strong>
  `);
  return totalPayment;
};


