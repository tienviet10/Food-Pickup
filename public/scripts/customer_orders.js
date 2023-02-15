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

  socket.on('connect', () => {
    console.log(socket.id);
    $.post('/api/customers/conn', { conn: socket.id });
  });


  socket.on("receive-message", () => {
    console.log("Order confirmed");

  });

  $(() => {
    loadCustomerOrders();
  });

  const loadCustomerOrders = () => {
    $.get("/api/customers/orders").then(data => renderCustomerOrders(data.orders));
  };

  const timer = (date, $element) => {
    const countDownDate = new Date(date).getTime();

    const runTimer = () => {
      const now = new Date().getTime();
      const distance = countDownDate - now;
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.ceil((distance % (1000 * 60 * 60)) / (1000 * 60));

      console.log(distance / 1000);
      if (distance < 0) {
        $element.text(0 + "h " + 0 + "m ");
      } else {
        $element.text(hours + "h " + minutes + "m ");
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
    // console.log(order.expected_completion);
    timer(order.expected_completion, $order.find('.timer'));

    let statusIndicator = 'text-warning';
    if (order.status === 'completed') {
      statusIndicator = 'text-success';
    } else if (order.status === 'in progress') {
      statusIndicator = 'text-info';
    }

    $order.find('.status').addClass(statusIndicator);
    $order.find(`#row_${order.id}`).on('click', function() {
      retrieveOrderDetail();
    });
    $order.find('.details-btn').on('click', function() {
      retrieveOrderDetail();
    });

    const retrieveOrderDetail = () => {
      console.log(order.id);
      $.post("/api/customers/order-details", {orderId: order.id}).then(data => {
        console.log(data.order);
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
      console.log(orders[orderId]);
      const $appendOrder = createOrderElement(orders[orderId]);
      $mainContainer.append($appendOrder);
    }
  };

});
