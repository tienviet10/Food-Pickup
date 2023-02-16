$(() => {
  const socket = io();

  $('#pay-order-btn').css('display', 'none');

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
      if ($('#spinner').length > 0) {
        $('#spinner').removeClass('show');
      }
    }, 1);
  };
  spinner();

  // socket
  socket.on('connect', () => {
    $.post('/api/customers/conn', { conn: socket.id });
  });

  socket.on("receive-message", (message) => {
    console.log(message);
    $('.toast-body').text(message);
    $('.toast').toast('show');
    loadCustomerOrders();
  });

  $(() => {
    loadCustomerOrders();
  });

  const loadCustomerOrders = () => {
    $.get("/api/customers/orders").then(data => renderCustomerOrders(data.orders));
  };

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

  const createOrderElement = (order) => {
    const $order = $(`
      <tr>
        <td id='row_${order.id}' data-toggle="modal" data-target="#exampleModalCenter" >${order.id}</td>
        <td>${order.name}</td>
        <td class='timer'></td>
        <td><span class="status">&bull;</span> ${order.status}</td>
        <td>$${order.total_payment}</td>
        <td>${new Date(order.order_date).toGMTString().replace('GMT','')}</td>
        <td><a class='details-btn' title="View Details" data-toggle="modal" data-target="#exampleModalCenter" ><i class="material-icons">&#xE5C8;</i></a>
        </td>
      </tr>
    `);


    const $statusField = $order.find('.status').closest('td');
    if (order.status === 'pending') {
      $statusField.empty().append(`<span class="status text-warning">&bull;</span> pending`);
    } else {
      timer(order.expected_completion, $order.find('.timer'), $statusField);
    }


    $order.find(`#row_${order.id}`).on('click', function() {
      retrieveOrderDetail();
    });
    $order.find('.details-btn').on('click', function() {
      retrieveOrderDetail();
    });

    const retrieveOrderDetail = () => {

      $.post("/api/customers/order-details", {orderId: order.id}).then(data => {
        const cartBody = $(".table-body");
        cartBody.empty();
        const foodCart = data.order;
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

      });
    };


    return $order;
  };

  const renderCustomerOrders = function(orders) {
    const $mainContainer = $('.table-body-customer-order');
    $mainContainer.empty();

    for (let orderId in orders) {
      const $appendOrder = createOrderElement(orders[orderId]);
      $mainContainer.append($appendOrder);
    }
  };

});
