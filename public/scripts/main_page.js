// Client facing scripts here
$(() => {
  const socket = io();
  let foodCart = {};
  let totalPayment = 0;
  const stripe = Stripe('pk_test_51K20YpCukaTecINAoUOQHSmjClZyiCm5neg15HTGMZFDwOQcEZqeQaSCBiDgBRWyvqzY9TTJkty2acHST3Fe4s8T003JfKaazx');

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

  $("#place-order").on("click", (event) => {
    const finalOrder = {};
    for (const dishId in foodCart) {
      finalOrder[dishId] = foodCart[dishId].quantity;
    }

    const sentVar = {
      finalOrder,
      totalPayment
    };

    $('#creditcard-container').append('<div>OLD</div>');

    $.post('/api/customers/request-payment', {data: JSON.stringify(sentVar)})
      .done((response) => {
        // foodCart = {};
        $("#close-modal").click();
        console.log(response);
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

        form.addEventListener('submit', async(event) => {
          event.preventDefault();
          console.log(event);
          const { error } = await stripe.confirmPayment({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
              return_url: 'http://localhost:8080/api/customers/stripe-info',
            },
          });

          if (error) {
            // This point will only be reached if there is an immediate error when
            // confirming the payment. Show error to your customer (for example, payment
            // details incomplete)
            const messageContainer = document.querySelector('#error-message');
            messageContainer.textContent = error.message;
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
              console.log(paymentIntent.status);
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
        });


      });
    ///// -> TODO: Make sure this is incorporated
    // $.post("/api/customers/place-order", finalOrder, function (data, status) {
    //   foodCart = {};
    //   $("#close-modal").click();
    // });
  });

  socket.on('connect', ()=> {
    console.log(socket.id);
    $.post('/api/customers/conn', {conn: socket.id});
  });


  socket.on("receive-message", ()=> {
    console.log("Order confirmed");

  });
});
