// Client facing scripts here
$(() => {
  const socket = io();

  $(() => {
    loadOrders();
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
    console.log(order);

    const formTemplate = `
    <div id="prep_${order.id}">
      <form class="form d-flex">
        <input data-id="${order.id}" class="form-control" type="number" name="duration" style="width: 80px" oninput='this.value = !!this.value && Math.abs(this.value) >= 0 ? Math.abs(this.value) : null' value="5" placeholder="5" min="1"/>
        <button type="submit" class="btn btn-success">
          Prep
        </button>
      </form>
    </div>
    `;

    const $order = $(`
      <tr>
        <td id='row_${order.id}' data-toggle="modal" data-target="#exampleModalCenter" >${order.id}</td>
        <td>${order.name}</td>
        <td class='timer'>${order.status === 'pending' ? formTemplate : ''}</td>
        <td><span class="status">&bull;</span> ${order.status}</td>
        <td>$${order.total_payment}</td>
        <td>${new Date(order.order_date).toGMTString().replace('GMT','')}</td>
        <td><a class='details-btn' title="View Details" data-toggle="modal" data-target="#exampleModalCenter" ><i class="material-icons">&#xE5C8;</i></a>
        </td>
      </tr>
    `);
    const timerField = $order.find('.timer');
    if (order.expected_completion) {
      timer(order.expected_completion, timerField);
    } else {
      const $form = $order.find('form');
      $form.on("submit", function(event) {
        event.preventDefault();
        console.log("first");
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
            timer(expectedCompletion * 1000, timerField);
            //$currentOrder.remove();
          }
        );
      });
    }


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
      $.post("/api/restaurants/order-details", {orderId: order.id}).then(data => {
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

    // const formTemplate = `
    // <div id="prep_${order.order_id}">
    //   <form class="form">
    //     <div class="form-group">
    //       <label for="duration">Duration:</label>
    //       <input data-id="${order.order_id}" class="form-control" type="text" name="duration" style="width: 300px" />
    //     </div>
    //     <button type="submit" class="btn btn-success">
    //       Prep
    //     </button>
    //   </form>
    // </div>
    // `;

    // let displayDish = '';

    // for (let dish of order.dishes) {
    //   displayDish += (`<div>Dish: ${dish[0]}; Quantity:${dish[1]}</div>`);
    // }

    // const $order = $(`
    //   <div>
    //     <div>${order.order_id} ${order.customer_name} ${order.status}</div>
    //     ${displayDish}
    //     ${order.status === 'pending' ? formTemplate : ''}
    //   </div>
    // `);

    // const $form = $order.find('form');
    // $form.on("submit", function(event) {
    //   event.preventDefault();
    //   const inputField = $(this).find('input[name="duration"]');
    //   const orderId = inputField.data("id");
    //   const duration = inputField.val();
    //   const expectedCompletion = ($.now() + duration * 60000) / 1000;
    //   const removeForm = "prep_" + orderId;

    //   $.post(
    //     "/api/restaurants/accept-order",
    //     { orderId, expectedCompletion },
    //     function(data, status) {
    //       $(`#${removeForm}`).empty();
    //       //$currentOrder.remove();
    //     }
    //   );
    // });
    return $order;
  };

  const renderOrders = function(orders, type) {
    //const $mainContainer = $('.restaurant-container');
    const $mainContainer = $('.table-body-restaurant-order');
    if (type === "all") {
      $mainContainer.empty();
    }
    for (let order of orders) {
      const $appendOrder = createOrderElement(order);
      $mainContainer.append($appendOrder);
    }
  };

  const loadOrders = () => {
    $.get("/api/restaurants/orders").then(data => renderOrders(data.orders, "all"));
  };

  socket.on('connect', () => {
    console.log(socket.id);
    $.post('/api/restaurants/conn', { conn: socket.id });
  });

  socket.on("receive-message", (data) => {
    console.log(data);
    renderOrders(data, "new");
  });


});
