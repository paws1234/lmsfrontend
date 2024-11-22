import CryptoJS from 'crypto-js';

const encryptionKeyBase64 = "/bdLq63o8GHzO/KFiXXVmRgShpXRSS2okcRmfwNbbwM=";
const encryptionKey = CryptoJS.enc.Base64.parse(encryptionKeyBase64);

// Intercept `localStorage.setItem` for token encryption
const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, value) {
  if (key === "token") {
    // Log the token before encryption
    console.log("Original token before encryption:", value);

    // Encrypt the token before saving to localStorage
    const encryptedToken = CryptoJS.AES.encrypt(value, encryptionKey, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString();

    // Log the encrypted token
    console.log("Encrypted token:", encryptedToken);

    // Save the encrypted token in localStorage
    originalSetItem.call(localStorage, key, encryptedToken);
  } else {
    // Otherwise, allow default behavior
    originalSetItem.call(localStorage, key, value);
  }
};

// Intercept `localStorage.getItem` for token decryption
const originalGetItem = localStorage.getItem;
localStorage.getItem = function (key) {
  if (key === "token") {
    const encryptedToken = originalGetItem.call(localStorage, key);
    if (encryptedToken) {
      // Log the encrypted token before decryption
      console.log("Retrieving encrypted token from localStorage:", encryptedToken);

      const decryptedBytes = CryptoJS.AES.decrypt(encryptedToken, encryptionKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedToken = decryptedBytes.toString(CryptoJS.enc.Utf8);

      // Log the decrypted token
      console.log("Decrypted token:", decryptedToken);

      return decryptedToken;
    }
    return null;
  } else {
    // Otherwise, allow default behavior
    return originalGetItem.call(localStorage, key);
  }
};
