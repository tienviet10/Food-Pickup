$(() => {
  const socket = io();

  // Spinner
  const spinner = function() {
    setTimeout(function() {
      const $spinner = $('#spinner');
      if ($spinner.length > 0) {
        $spinner.removeClass('show');
      }
    }, 1);
  };
  spinner();

  // Load all orders for restaurant
  $(() => {
    loadOrders();
  });

  const loadOrders = () => {
    $.get("/api/restaurants/orders").then(data => renderOrders(data.orders, "all"));
  };

  // Iterate over all orders
  const renderOrders = function(orders, type) {
    const $mainContainer = $('.table-body-restaurant-order');
    if (type === "all") {
      $mainContainer.empty();
    }
    for (let order of orders) {
      const $appendOrder = createOrderElement(order);
      $mainContainer.append($appendOrder);
    }
  };

  // Render each order at a time
  const createOrderElement = (order) => {
    const customerId = order.id;
    const formTemplate = `
    <div id="prep_${customerId}">
      <form class="form d-flex">
        <input data-id="${customerId}" class="form-control" type="number" name="duration" style="width: 80px" oninput='this.value = !!this.value && Math.abs(this.value) >= 0 ? Math.abs(this.value) : null' value="5" placeholder="5" min="1"/>
        <button type="submit" class="btn btn-success">
          Prep
        </button>
      </form>
    </div>
    `;
    const countDownTimer = order.status === 'pending' ? formTemplate : '';
    const $order = rowTemplate(customerId, order.name, countDownTimer, order.status, order.total_payment, order.order_date);
    const $statusField = $order.find('.status').closest('td');
    if (order.status === 'pending') {
      $statusField.empty().append(`<span class="status text-warning">&bull;</span> pending`);
    }

    const $timerField = $order.find('.timer');
    if (order.expected_completion) {
      timer(order.expected_completion, $timerField, $statusField);
    } else {
      const $form = $order.find('form');
      $form.on("submit", function(event) {
        event.preventDefault();

        const $inputField = $(this).find('input[name="duration"]');
        const orderId = $inputField.data("id");
        const duration = $inputField.val();
        const expectedCompletion = ($.now() + duration * 60000) / 1000;
        const removeForm = "prep_" + orderId;

        $.post(
          "/api/restaurants/accept-order",
          { orderId, expectedCompletion },
          function(data, status) {
            $(`#${removeForm}`).empty();
            timer(expectedCompletion * 1000, $timerField, $statusField);
          }
        );
      });
    }

    $order.find(`#row_${customerId}`).on('click', function() {
      retrieveOrderDetail(customerId, 'restaurants');
    });
    $order.find('.details-btn').on('click', function() {
      retrieveOrderDetail(customerId, 'restaurants');
    });

    return $order;
  };


  // Hide "Pay" button on Orders Page
  $('#pay-order-btn').css('display', 'none');

  // When connected -> Save socket id to DB due to multiple page problems
  socket.on('connect', () => {
    $.post('/api/restaurants/conn', { conn: socket.id });
  });

  // Notification to owner about new orders
  socket.on("receive-message", (data) => {
    const $toastBody = $('.toast-body');
    $toastBody.text('You have received a new order!');
    $toastBody.closest('.toast').toast('show');
    renderOrders(data, "new");
  });
});
