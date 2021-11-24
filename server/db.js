// THIS MODULE HOLDS ALL THE QUERIES WE'LL BE USING TO TALK TO OUR DATABASE

var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/netzung"
);

module.exports.register = (first, last, email, password) => {
    const q = `
INSERT into users (first, last, email, password) 
VALUES ($1, $2, $3, $4) RETURNING *`;
    const params = [first, last, email, password];

    return db.query(q, params);
};

module.exports.getHashedPW = (usersEmail) => {
    // const q = `SELECT * FROM users`;
    const q = `SELECT * FROM users WHERE email = ($1)`;
    const params = [usersEmail];
    return db.query(q, params);
};

module.exports.getEmail = (usersEmail) => {
    // const q = `SELECT * FROM users`;
    const q = `SELECT * FROM users WHERE email = ($1)`;
    const params = [usersEmail];
    return db.query(q, params);
};

module.exports.storeReset_codes = (email, secretCode) => {
    const q = `
INSERT into reset_codes (email, code)
VALUES ($1, $2) RETURNING *`;
    const params = [email, secretCode];

    return db.query(q, params);
};

module.exports.getValidCodes = () => {
    const q = `
SELECT * FROM reset_codes
WHERE CURRENT_TIMESTAMP - timestamp < INTERVAL '10 minutes'`;
    // const params = [userCode];
    return db.query(q);
};

module.exports.resetPassword = (email, password) => {
    const q = `
UPDATE users
SET password = ($2)
WHERE email = ($1)
RETURNING *
`;
    const params = [email, password];

    return db.query(q, params);
};

module.exports.getUser = (userId) => {
    const q = `SELECT * FROM users WHERE id = ($1)`;
    const params = [userId];
    return db.query(q, params);
};

module.exports.updateProfilePic = (profilePicUrl, userId) => {
    const q = `
UPDATE users
SET profilePicUrl = ($1)
WHERE id = ($2)
RETURNING *
`;
    const params = [profilePicUrl, userId];

    return db.query(q, params);
};

module.exports.updateBio = (bio, userId) => {
    const q = `
UPDATE users
SET bio = ($1)
WHERE id = ($2)
RETURNING *
`;
    const params = [bio, userId];

    return db.query(q, params);
};

module.exports.getRecentlyJoined = () => {
    const q = `SELECT * FROM users ORDER BY id DESC LIMIT 3;`;
    return db.query(q);
};

module.exports.findPeople = (inputVal) => {
    const q = `SELECT * FROM users WHERE first ILIKE $1 OR last ILIKE $1;`;
    const params = [inputVal + "%"];
    return db.query(q, params);
};

module.exports.checkRelationship = (recipient_id, sender_id) => {
    const q = `
SELECT * FROM friends
WHERE (recipientid = $1 AND senderid = $2)
OR (recipientid = $2 AND senderid = $1);`;
    const params = [recipient_id, sender_id];

    return db.query(q, params);
};

module.exports.MakeFriendRequest = (senderid, recipientid) => {
    const q = `
INSERT into friends (senderid, recipientid) 
VALUES ($1, $2) RETURNING *`;
    const params = [senderid, recipientid];

    return db.query(q, params);
};

module.exports.deleteFriendRequest = (recipient_id, sender_id) => {
    const q = `
DELETE FROM friends
WHERE (recipientid = $1 AND senderid = $2)
OR (recipientid = $2 AND senderid = $1);
`;
    const params = [recipient_id, sender_id];

    return db.query(q, params);
};

module.exports.acceptFriendRequest = (recipient_id, sender_id) => {
    const q = `
UPDATE friends
SET accepted = true
WHERE (recipientid = $1 AND senderid = $2)
OR (recipientid = $2 AND senderid = $1)
RETURNING *`;
    const params = [recipient_id, sender_id];

    return db.query(q, params);
};

module.exports.getFriends = (userId) => {
    const q = `    SELECT users.id, first, last, profilePicUrl, accepted
    FROM friends
    JOIN users
    ON (accepted = false AND recipientid = $1 AND senderid = users.id)
    OR (accepted = true AND recipientid = $1 AND senderid = users.id)
    OR (accepted = true AND senderid = $1 AND recipientid = users.id)`;
    const params = [userId];
    return db.query(q, params);
};

module.exports.getChatMessages = () => {
    const q = `SELECT messages.id, users.first, users.last, users.profilepicurl, messages.senderid, messages.timestamp, messages.message
    FROM users
    RIGHT JOIN messages
    on users.id = messages.senderid
    ORDER BY messages.id DESC
    LIMIT 10`;
    return db.query(q);
};

module.exports.postChatMessage = (senderid, message) => {
    const q = `
INSERT into messages (senderid, message) 
VALUES ($1, $2) RETURNING *`;
    const params = [senderid, message];

    return db.query(q, params);
};

module.exports.deleteChatMessage = (messageId) => {
    const q = `
DELETE FROM messages
WHERE id = $1
RETURNING *
`;
    const params = [messageId];

    return db.query(q, params);
};

////////////////

// module.exports.getUser = (userId) => {
//     const q = `SELECT first, last, email, age, city, url FROM users
//     JOIN user_profiles
// ON users.id = user_profiles.user_id
// WHERE users.id = ($1)
// `;
//     const params = [userId];
//     return db.query(q, params);
// };

// module.exports.getId = () => {
//     const q = `SELECT * FROM signatures`;
//     return db.query(q);
// };

// module.exports.getSigners = () => {
//     const q = `SELECT first, last, age, city, url FROM users
//     RIGHT JOIN signatures
//     ON users.id = signatures.user_id
//     JOIN user_profiles
// ON users.id = user_profiles.user_id
// `;
//     return db.query(q);
// };

// module.exports.getNameAndSignature = (user_id) => {
//     const q = `SELECT first, last, signature FROM users
//     LEFT JOIN signatures
//     ON users.id = signatures.user_id
//     WHERE user_id = ($1)`;
//     const params = [user_id];
//     return db.query(q, params);
// };

// module.exports.getSignersByCity = (city) => {
//     const q = `SELECT first, last, age, city, url FROM users
//     RIGHT JOIN signatures
//     ON users.id = signatures.user_id
//     JOIN user_profiles
// ON users.id = user_profiles.user_id
// WHERE city = ($1)
// `;
//     const params = [city];
//     return db.query(q, params);
// };

// module.exports.getNumberOfSigners = () => {
//     const q = `SELECT count (*) FROM signatures`;
//     return db.query(q);
// };

// module.exports.updateInfoNoPW = (user_id, first, last, email) => {
//     const q = `
// UPDATE users
// SET first = ($2),
// last = ($3),
// email = ($4)
// WHERE id = ($1)
// `;
//     const params = [user_id, first, last, email];

//     return db.query(q, params);
// };

// module.exports.upsertProfiles = (age, city, url, user_id) => {
//     const q = `
// INSERT into user_profiles (age, city, url, user_id)
// VALUES ($1, $2, $3, $4)
// ON CONFLICT (user_id)
// DO UPDATE SET
// age = ($1),
// city = ($2),
// url = ($3)
// `;
//     const params = [age, city, url, user_id];

//     return db.query(q, params);
// };

// module.exports.addDetails = (age, city, url, user_id) => {
//     const q = `
// INSERT into user_profiles (age, city, url, user_id)
// VALUES ($1, $2, $3, $4) RETURNING id`;
//     const params = [age, city, url, user_id];

//     return db.query(q, params);
// };

// module.exports.deleteSignature = (user_id) => {
//     const q = `
//     DELETE FROM signatures
//     WHERE user_id = ($1)`;
//     const params = [user_id];
//     return db.query(q, params);
// };

// // INSERT into signatures (first, last, signature)
// // VALUES ('Paul', 'Evans', '');
