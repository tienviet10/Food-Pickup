$(() => {
  const socket = io();

  // make nav link active
  const path = window.location.href;
  $('div a').each(function() {
    if (this.href === path) {
      $(this).addClass('active');
    }
  });

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

  // Load all orders for customer
  $(() => {
    loadCustomerOrders();
  });

  const loadCustomerOrders = () => {
    $.get("/api/customers/orders").then(data => renderCustomerOrders(data.orders));
  };

  // Iterate over all orders
  const renderCustomerOrders = function(orders) {
    const $mainContainer = $('.table-body-customer-order');
    $mainContainer.empty();

    for (let orderId in orders) {
      const $appendOrder = createOrderElement(orders[orderId]);
      $mainContainer.append($appendOrder);
    }
  };

  // Render each order at a time
  const createOrderElement = (order) => {
    const customerId = order.id;
    const $order = rowTemplate(customerId, order.name, '', order.status, order.total_payment, order.order_date);
    const $statusField = $order.find('.status').closest('td');

    if (order.status === 'pending') {
      $statusField.empty().append(`<span class="status text-warning">&bull;</span> pending`);
    } else {
      timer(order.expected_completion, $order.find('.timer'), $statusField);
    }

    $order.find(`#row_${customerId}`).on('click', function() {
      retrieveOrderDetail(customerId, 'customers');
    });
    $order.find('.details-btn').on('click', function() {
      retrieveOrderDetail(customerId, 'customers');
    });

    return $order;
  };


  // Hide "Pay" button on Orders Page
  $('#pay-order-btn').css('display', 'none');

  // When connected -> Save socket id to DB due to multiple page problems
  socket.on('connect', () => {
    $.post('/api/customers/conn', { conn: socket.id });
  });

  // Toast and reload all customer orders
  socket.on("receive-message", (message) => {
    const $toastBody = $('.toast-body');
    $toastBody.text(message);
    $toastBody.closest('.toast').toast('show');
    loadCustomerOrders();
  });
});
