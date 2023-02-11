INSERT INTO
  orders (
    id,
    user_id,
    restaurant_id,
    expected_completion,
    status
  )
VALUES
  (1, 1, 1, NULL, 'pending'),
  (
    2,
    2,
    1,
    '2023-02-10 21:43:23.626482',
    'in progress'
  ),
  (
    3,
    3,
    1,
    '2023-02-10 18:43:23.626482',
    'confirmed'
  );
