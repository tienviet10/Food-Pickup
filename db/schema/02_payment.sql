DROP TABLE IF EXISTS payment CASCADE;

CREATE TABLE payment (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL DEFAULT 'card',
  payment_method VARCHAR(100) NOT NULL,
  last4 VARCHAR(10) NOT NULL,
  created_on TIMESTAMP NOT NULL DEFAULT NOW()
);