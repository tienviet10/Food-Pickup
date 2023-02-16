DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  expected_completion TIMESTAMP,
  status VARCHAR(100) NOT NULL,
  receipt_id TEXT,
  total_payment DECIMAL(6, 2),
  payment_completion BOOLEAN NOT NULL DEFAULT FALSE,
  order_date TIMESTAMP NOT NULL DEFAULT NOW()
);
