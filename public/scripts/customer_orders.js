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

});
