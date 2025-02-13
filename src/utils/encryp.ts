const CryptoJS = require('crypto-js');

const key: string | undefined = process.env.KEY_ENCRYP;

function encrypAES(data: string){
  return CryptoJS.AES.encrypt(data, key).toString();
}

function decrypAES(data: string){
  var wA= CryptoJS.AES.decrypt(data, key);
  return wA.toString(CryptoJS.enc.Utf8);
}


function encrypDES(data: string){
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const encrypted = CryptoJS.DES.encrypt(data, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

function decrypDES(data: string){
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const decrypted = CryptoJS.DES.decrypt(data, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}


export default {
  encrypAES,
  decrypAES,
  encrypDES,
  decrypDES
}