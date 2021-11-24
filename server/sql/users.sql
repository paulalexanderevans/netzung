DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL,
    last VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL
);

SELECT * FROM users

-- Alter Table
-- add profilePicUrl column
ALTER TABLE users
ADD profilePicUrl VARCHAR;

-- add bio column
ALTER TABLE users
ADD bio VARCHAR;