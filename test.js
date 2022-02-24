var CryptoJS = require("crypto-js");

// Encrypt
var ciphertext = CryptoJS.AES.encrypt('my message', 'secret key123').toString();

// Decrypt
var bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key123');
var originalText = bytes.toString(CryptoJS.enc.Utf8);

console.log(ciphertext);
console.log(originalText);