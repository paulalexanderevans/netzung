DROP TABLE IF EXISTS friends;

CREATE TABLE friends(
id SERIAL PRIMARY KEY,
senderid INT REFERENCES users(id) NOT NULL,
recipientid INT REFERENCES users(id) NOT NULL,
accepted BOOLEAN DEFAULT false
);

SELECT * FROM friends