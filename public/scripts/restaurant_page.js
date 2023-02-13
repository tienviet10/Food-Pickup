// Client facing scripts here
$(() => {
  $(".form").on("submit", function (event) {
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
      }
    );
  });

  // $("#testtest").on('click', function(){
  //   $.post('http://localhost:8080/api/restaurants/complete-order',{order_id: 4})
  // })
});
