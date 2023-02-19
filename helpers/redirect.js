const redirectBasedOnRole = (role) => {
  if (role === 'cus') {
    return '/customers/menu-page';
  }

  if (role === 'res') {
    return '/restaurants/restaurant-order';
  }

  return '/';
}

module.exports = { redirectBasedOnRole };
