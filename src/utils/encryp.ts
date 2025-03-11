const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const keyDefault: string = process.env.KEY_ENCRYP || "secret";

function generateSecretKey() {
  return crypto.randomBytes(32).toString('hex');
}

function encrypAES(data: string, key: string = keyDefault){
  return CryptoJS.AES.encrypt(data, key).toString();
}

function decrypAES(data: string, key: string = keyDefault){
  var wA= CryptoJS.AES.decrypt(data, key);
  return wA.toString(CryptoJS.enc.Utf8);
}


function encrypDES(data: string, key: string = keyDefault){
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const encrypted = CryptoJS.DES.encrypt(data, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

function decrypDES(data: string, key: string = keyDefault){
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const decrypted = CryptoJS.DES.decrypt(data, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}


export default {
  generateSecretKey,
  encrypAES,
  decrypAES,
  encrypDES,
  decrypDES
}