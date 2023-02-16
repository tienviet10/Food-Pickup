$(() => {
  const socket = io();
  let foodCart = {};
  let totalPayment = 0;
  const stripe = Stripe('pk_test_51K20YpCukaTecINAoUOQHSmjClZyiCm5neg15HTGMZFDwOQcEZqeQaSCBiDgBRWyvqzY9TTJkty2acHST3Fe4s8T003JfKaazx');

  // Spinner
  const spinner = function() {
    setTimeout(function() {
      if ($('#spinner').length > 0) {
        $('#spinner').removeClass('show');
      }
    }, 1);
  };
  spinner();

  // make nav link active
  const path = window.location.href;
  $('div a').each(function() {
    if (this.href === path) {
      $(this).addClass('active');
    }
  });


  $("#cart-btn").on("click", function() {
    const cartBody = $(".table-body");
    cartBody.empty();
    let total = 0;
    totalPayment = 0;
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
    totalPayment = Math.round(total * 1.13 * 100) / 100;
    $(".cart-total").empty().append(`
      <strong>$${totalPayment}</strong>
    `);
  });

  $("#pay-order-btn").on("click", (event) => {
    $('#modal-spinner').css('display', 'flex');
    $('#modal-cards-area').empty();
    const finalOrder = {};
    for (const dishId in foodCart) {
      finalOrder[dishId] = foodCart[dishId].quantity;
    }

    const sentVar = {
      finalOrder,
      totalPayment
    };

    // $('.modal-body').append('<div>OLD</div>');

    $("#close-modal").click();

    $.get("/api/customers/payment-methods").then(data => {
      $('#modal-spinner').css('display', 'none');
      $('#payment-element').empty();

      for (const paymentIndex in data.payments) {
        $('#modal-cards-area').append(`
        <div class="form-check m-2">
          <input class="form-check-input" type="radio" name="credit-card-number" id="flexRadioDefault_${data.payments[paymentIndex].id}" value="${data.payments[paymentIndex].id}" ${paymentIndex === '0' ? 'checked' : ''}>
          <label class="form-check-label" for="flexRadioDefault_${data.payments[paymentIndex].id}">
            **** **** **** ${data.payments[paymentIndex].last4}
          </label>
        </div>

        `);
      }
    });

    $('#add-new-cards').on('click', function() {
      $('#modal-spinner').css('display', 'flex');
      $('#customer-cards').removeClass("active");
      $(this).addClass("active");
      $('#modal-cards-area').empty();
      $('#cards-btn').css('display', 'none');
      $('#add-card-btn').css('display', 'flex');
      console.log(sentVar);
      $.post('/api/customers/request-payment', { data: JSON.stringify(sentVar) })
        .done((response) => {
          // foodCart = {};

          const options = {
            clientSecret: response.client_secret,
            // Fully customizable with appearance API.
            appearance: {/*...*/ },
          };

          // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 3
          const elements = stripe.elements(options);

          // Create and mount the Payment Element
          const paymentElement = elements.create('payment');
          paymentElement.mount('#payment-element');

          const form = document.getElementById('payment-form');

          setTimeout(() => {
            $('#modal-spinner').css('display', 'none');
          }, 350);

          form.addEventListener('submit', async (event) => {
            event.preventDefault();
            $('#place-order').prop('disabled', true);

            $('#modal-spinner').css('display', 'flex');
            const { error } = await stripe.confirmPayment({
              //`Elements` instance that was used to create the Payment Element
              elements,
              confirmParams: {
                return_url: `https://www.foodwise.live/api/customers/stripe-info`,
                //return_url: `http://localhost:8080/api/customers/stripe-info`,
              },
            });

            if (error) {
              // This point will only be reached if there is an immediate error when
              // confirming the payment. Show error to your customer (for example, payment
              // details incomplete)
              const messageContainer = document.querySelector('#error-message');
              messageContainer.textContent = error.message;
              $('#place-order').prop('disabled', false);
            } else {
              // Your customer will be redirected to your `return_url`. For some payment
              // methods like iDEAL, your customer will be redirected to an intermediate
              // site first to authorize the payment, then redirected to the `return_url`.
              const clientSecret = new URLSearchParams(window.location.search).get(
                'payment_intent_client_secret'
              );

              // Retrieve the PaymentIntent
              stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
                const message = document.querySelector('#message');

                // Inspect the PaymentIntent `status` to indicate the status of the payment
                // to your customer.
                //
                // Some payment methods will [immediately succeed or fail][0] upon
                // confirmation, while others will first enter a `processing` state.
                //
                // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
                switch (paymentIntent.status) {
                  case 'succeeded':
                    message.innerText = 'Success! Payment received.';
                    break;

                  case 'processing':
                    message.innerText = "Payment processing. We'll update you when payment is received.";
                    break;

                  case 'requires_payment_method':
                    message.innerText = 'Payment failed. Please try another payment method.';
                    // Redirect your user back to your payment page to attempt collecting
                    // payment again
                    break;

                  default:
                    message.innerText = 'Something went wrong.';
                    break;
                }
              });
            }
            $('#modal-spinner').css('display', 'none');
          });

        });
    });

  });

  $('#place-order-2').on('click', function() {
    $(this).prop('disabled', true);
    $('#modal-spinner').css('display', 'flex');
    const chosenCreditCard = $('input:radio[name=credit-card-number]:checked').val();
    const finalOrder = {};
    for (const dishId in foodCart) {
      finalOrder[dishId] = foodCart[dishId].quantity;
    }

    const sentVar = {
      finalOrder,
      totalPayment,
      creditcard: chosenCreditCard,
    };

    $.post('/api/customers/stored-cards-payment', { data: JSON.stringify(sentVar) })
      .done((response) => {

        foodCart = {};
        totalPayment = 0;
        $('#cart-badge').css('visibility', 'hidden');
        $('#modal-spinner').css('display', 'none');
        $(this).prop('disabled', false);
        $("#close-modal-2").click();
      });
  });

  $('#customer-cards').on('click', function() {
    $('#add-new-cards').removeClass("active");
    $(this).addClass("active");
    $.get("/api/customers/payment-methods").then(data => {
      $('#modal-spinner').css('display', 'none');
      $('#cards-btn').css('display', 'flex');
      $('#add-card-btn').css('display', 'none');
      $('#modal-cards-area').empty();
      $('#payment-element').empty();
      for (const paymentIndex in data.payments) {
        $('#modal-cards-area').append(`
        <div class="form-check m-2">
        <input class="form-check-input" type="radio" name="credit-card-number" id="flexRadioDefault_${data.payments[paymentIndex].id}" value="${data.payments[paymentIndex].id}" ${paymentIndex === '0' ? 'checked' : ''}>
        <label class="form-check-label" for="flexRadioDefault_${data.payments[paymentIndex].id}">
          **** **** **** ${data.payments[paymentIndex].last4}
        </label>
      </div>
        `);
      }
    });
  });

  socket.on('connect', () => {
    $.post('/api/customers/conn', { conn: socket.id });
  });


  socket.on("receive-message", (message) => {
    console.log("Order confirmed");
    $('.toast-body').text(message);
    $('.toast').toast('show');
  });

  $('.form').on('submit', function(event) {
    event.preventDefault();

    const $inputField = $(this).find('input[name="quantity"]');
    const dishId = $inputField.data('id');
    const dishName = $inputField.data('name');
    const dishPrice = $inputField.data('price');
    const dishQuantity = parseInt($inputField.val());
    if (dishQuantity !== 0) {
      if (foodCart[dishId]) {
        foodCart[dishId].quantity += dishQuantity;
      } else {
        foodCart[dishId] = {
          quantity: dishQuantity,
          name: dishName,
          price: dishPrice,
        };
      }
      $('#cart-badge').css('visibility', 'visible');
      $inputField.val(0);
      $('#pay-order-btn').prop('disabled', false);
    }
  });


});
