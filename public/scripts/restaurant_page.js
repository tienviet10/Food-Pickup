// Client facing scripts here
$(() => {
  $(".form").on("submit", function (event) {
    event.preventDefault();
    const inputField = $(this).find('input[name="duration"]');
    const order_id = inputField.data("id");
    const duration = inputField.val();
    const expected_completion = ($.now() + duration * 60000) / 1000;
    const removeForm = "prep_" + order_id;
    console.log(removeForm);

    $.post(
      "/api/restaurants/accept-order",
      { order_id, expected_completion },
      function (data, status) {
        $(`#${removeForm}`).empty();
      }
    );
  });
});
