const bcrypt = require("bcryptjs");
const { promisify } = require("util");
let { genSalt, hash, compare } = bcrypt;

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

//DEMO OF HOW THESE FUNCTIONS WORK
//GENSALT: genSalt generates a random string of characters
// genSalt()
//     .then((salt) => {
//         // console.log("salt: ", salt);
//         // HASH
//         // hash expects two parameters, 1st: a clear text password, 2nd: a slat
//         return hash("password", salt);
//     })
//     .then((hashedPW) => {
//         // console.log("hashed password with salt is: ", hashedPW);
//         return compare("password", hashedPW);
//     })
//     .then((matchValueOfCompare) => {
//         // console.log("passwords match: ", matchValueOfCompare);
//     });

//

module.exports.compare = compare;
module.exports.hash = (plainTextPassword) =>
    genSalt().then((salt) => hash(plainTextPassword, salt));
