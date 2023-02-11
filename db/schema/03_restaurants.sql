DROP TABLE IF EXISTS restaurants CASCADE;

CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  rating SMALLINT,
  url TEXT,
  owner_id INTEGER REFERENCES restaurant_owners(id) ON DELETE CASCADE,
  date_established TIMESTAMP DEFAULT NOW()
);
