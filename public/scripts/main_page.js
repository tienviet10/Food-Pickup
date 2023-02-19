$(() => {
  const socket = io();
  let foodCart = {};
  let totalPayment = 0;
  const stripe = Stripe('pk_test_51K20YpCukaTecINAoUOQHSmjClZyiCm5neg15HTGMZFDwOQcEZqeQaSCBiDgBRWyvqzY9TTJkty2acHST3Fe4s8T003JfKaazx');
  const $payBtn = $('#pay-order-btn');
  const $modalSpinner = $('#modal-spinner');
  const $addNewCardTab = $('#add-new-cards');
  const $existingCardTab = $('#customer-cards');
  const $existingCardPayBtn = $('#cards-btn');
  const $addNewCardPayBtn = $('#add-card-btn');
  const $paymentElement = $('#payment-element');
  const $modalCardArea = $('#modal-cards-area');

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

  // Create rows for displaying order details
  $("#cart-btn").on("click", function() {
    totalPayment = createDetailTable(Object.values(foodCart));
  });

  const finalOrderObject = () => {
    const finalOrder = {};
    for (const dishId in foodCart) {
      finalOrder[dishId] = foodCart[dishId].quantity;
    }

    return {
      finalOrder,
      totalPayment
    };
  };

  // Pay button inside Show Carts
  $payBtn.on("click", (event) => {
    $modalSpinner.css('display', 'flex');
    $existingCardPayBtn.css('display', 'flex');
    $addNewCardPayBtn.css('display', 'none');
    $existingCardTab.addClass("active");
    $addNewCardTab.removeClass("active");
    $paymentElement.empty();
    $modalCardArea.empty();
    $("#close-modal").click();

    getCustomerCards();
  });

  $addNewCardTab.on('click', function() {
    $(this).addClass("active");
    $modalSpinner.css('display', 'flex');
    $existingCardPayBtn.css('display', 'none');
    $addNewCardPayBtn.css('display', 'flex');
    $existingCardTab.removeClass("active");
    $modalCardArea.empty();

    // Send final object to backend for payment intent
    const sentVar = finalOrderObject();
    $.post('/api/customers/request-payment', { data: JSON.stringify(sentVar) })
      .done((response) => {
        const options = {
          clientSecret: response.client_secret,
          appearance: {},
        };

        // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 3
        const elements = stripe.elements(options);

        // Create and mount the Payment Element
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');

        const form = document.getElementById('payment-form');

        // Delay spinner 350 ms
        setTimeout(() => {
          $modalSpinner.css('display', 'none');
        }, 350);

        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          $('#place-order').prop('disabled', true);

          $modalSpinner.css('display', 'flex');
          const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `https://www.foodwise.live/api/customers/stripe-info`,
              // return_url: `http://localhost:8080/api/customers/stripe-info`,
            },
          });

          if (error) {
            const messageContainer = document.querySelector('#error-message');
            messageContainer.textContent = error.message;
            $('#place-order').prop('disabled', false);
          } else {
            const clientSecret = new URLSearchParams(window.location.search).get(
              'payment_intent_client_secret'
            );

            // Retrieve the PaymentIntent
            stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
              const message = document.querySelector('#message');
              switch (paymentIntent.status) {
                case 'succeeded':
                  message.innerText = 'Success! Payment received.';
                  break;

                case 'processing':
                  message.innerText = "Payment processing. We'll update you when payment is received.";
                  break;

                case 'requires_payment_method':
                  message.innerText = 'Payment failed. Please try another payment method.';
                  break;

                default:
                  message.innerText = 'Something went wrong.';
                  break;
              }
            });
          }
          $modalSpinner.css('display', 'none');
        });

      });
  });

  // Pay button for existing credit cards tab
  $('#place-order-2').on('click', function() {
    $(this).prop('disabled', true);
    $modalSpinner.css('display', 'flex');
    const chosenCreditCard = $('input:radio[name=credit-card-number]:checked').val();
    const sentVar = finalOrderObject();
    sentVar['creditcard'] = chosenCreditCard;

    $.post('/api/customers/stored-cards-payment', { data: JSON.stringify(sentVar) })
      .done((response) => {
        foodCart = {};
        totalPayment = 0;
        $('#cart-badge').css('visibility', 'hidden');
        $modalSpinner.css('display', 'none');
        $(this).prop('disabled', false);
        $("#close-modal-2").click();
      });
  });

  // Get existing cards
  $existingCardTab.on('click', function() {
    $(this).addClass("active");
    $addNewCardTab.removeClass("active");
    getCustomerCards();
  });

  // Add chosen dish item to food cart and show badge
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
          dish_name: dishName,
          price: dishPrice,
        };
      }
      $('#cart-badge').css('visibility', 'visible');
      $inputField.val(0);
      $payBtn.prop('disabled', false);
    }
  });

  // When connected -> Save socket id to DB due to multiple page problems
  socket.on('connect', () => {
    $.post('/api/customers/conn', { conn: socket.id });
  });

  // Send notification to users about their orders
  socket.on("receive-message", (message) => {
    const $toastBody = $('.toast-body');
    $toastBody.text(message);
    $toastBody.closest('.toast').toast('show');
  });

  // Get all credit cards for customer
  const getCustomerCards = () => {
    $.get("/api/customers/payment-methods").then(data => {
      $modalSpinner.css('display', 'none');
      $existingCardPayBtn.css('display', 'flex');
      $addNewCardPayBtn.css('display', 'none');
      $modalCardArea.empty();
      $paymentElement.empty();
      for (const paymentIndex in data.payments) {
        $modalCardArea.append(`
        <div class="form-check m-2">
        <input class="form-check-input" type="radio" name="credit-card-number" id="flexRadioDefault_${data.payments[paymentIndex].id}" value="${data.payments[paymentIndex].id}" ${paymentIndex === '0' ? 'checked' : ''}>
        <label class="form-check-label" for="flexRadioDefault_${data.payments[paymentIndex].id}">
          **** **** **** ${data.payments[paymentIndex].last4}
        </label>
      </div>
        `);
      }
    });
  };
});
