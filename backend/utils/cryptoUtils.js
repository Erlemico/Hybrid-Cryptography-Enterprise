const crypto = require('crypto');
const fs = require('fs');

// Function for encryption using AES
function encryptWithAES(fileBuffer, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encryptedData = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    return { encryptedData, iv };
}

// Function for AES key encryption using RSA
function encryptAESKeyWithRSA(key, publicKey) {
    return crypto.publicEncrypt(publicKey, key);
}

// AES key decryption function using RSA
function decryptAESKeyWithRSA(encryptedKey, privateKey) {
    return crypto.privateDecrypt(privateKey, encryptedKey);
}

// File decryption function using AES
function decryptWithAES(encryptedData, key, iv) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    return decryptedData;
}

module.exports = { encryptWithAES, encryptAESKeyWithRSA, decryptAESKeyWithRSA, decryptWithAES };