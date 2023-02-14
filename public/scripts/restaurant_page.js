// Client facing scripts here
$(() => {
  const socket = io();

  $(() => {
    // load initial tweets
    loadOrders();
  });

  const createOrderElement = (order) => {
    const formTemplate =  `
    <div id="prep_${order.order_id}">
      <form class="form">
        <div class="form-group">
          <label for="duration">Duration:</label>
          <input data-id="${order.order_id}" class="form-control" type="text" name="duration" style="width: 300px" />
        </div>
        <button type="submit" class="btn btn-success">
          Prep
        </button>
      </form>
    </div>
    `;

    let displayDish = '';

    for (let dish of order.dishes) {
      displayDish += (`<div>Dish: ${dish[0]}; Quantity:${dish[1]}</div>`);
    }

    const $order = $(`
      <div>
        <div>${order.order_id} ${order.customer_name}</div>
        ${displayDish}
        ${order.status === 'pending' ? formTemplate : ''}
      </div>
    `);
    const $form = $order.find('form');
    $form.on("submit", function(event) {
      event.preventDefault();
      const inputField = $(this).find('input[name="duration"]');
      const orderId = inputField.data("id");
      const duration = inputField.val();
      const expectedCompletion = ($.now() + duration * 60000) / 1000;
      const removeForm = "prep_" + orderId;

      $.post(
        "/api/restaurants/accept-order",
        { orderId, expectedCompletion },
        function(data, status) {
          $(`#${removeForm}`).empty();
          //$currentOrder.remove();
        }
      );
    });
    return $order;
  };

  const renderOrders = function(orders, type) {
    const $mainContainer = $('.container');
    if (type === "all") {
      $mainContainer.empty();
    }
    for (let orderId in orders) {
      const $appendOrder = createOrderElement(orders[orderId]);
      $mainContainer.append($appendOrder);
    }
  };

  const loadOrders = () => {
    $.get("/api/restaurants/orders").then(data => renderOrders(data.cleanOrders, "all"));
  };

  socket.on('connect', () => {
    console.log(socket.id);
    $.post('/api/restaurants/conn', { conn: socket.id });
  });

  socket.on("receive-message", (data) => {
    renderOrders(data, "new");
  });

  // $("#testtest").on('click', function(){
  //   $.post('http://localhost:8080/api/restaurants/complete-order',{order_id: 4})
  // })
});
