// Client facing scripts here
$(() => {
  $(".form").on("submit", function (event) {
    event.preventDefault();

    const duration = $(this).find('input[name="duration"]').val();
    // const currentTime = Date.now();
    // console.log(currentTime);
    const constcurrentTime = new Date($.now());
    const newTime = new Date($.now() + duration*60000);
    console.log(constcurrentTime);
    console.log(newTime);
  });
});

