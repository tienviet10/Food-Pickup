DROP TABLE IF EXISTS restaurant_owners CASCADE;

CREATE TABLE restaurant_owners (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  date_registered TIMESTAMP DEFAULT NOW()
);
