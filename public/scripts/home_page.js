$(() => {
  // Spinner
  const spinner = function() {
    setTimeout(function() {
      const $spinner = $('#spinner');
      if ($spinner.length > 0) {
        $spinner.removeClass('show');
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
});
