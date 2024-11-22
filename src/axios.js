import axios from "axios";
import CryptoJS from "crypto-js";

// Create an Axios instance
const instance = axios.create({
  baseURL: "http://localhost:8000/api", // Base API URL
});

// Add request interceptor to include the Authorization token in all requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Decode the token if necessary before attaching it to the headers
      const decodedToken = atob(token);  // Base64 decode the token
      config.headers["Authorization"] = `Bearer ${decodedToken}`;
    }
      if (config.data && typeof config.data === 'object') {
        // Encode the JSON data to a Base64 string
        const encodedData = btoa(JSON.stringify(config.data));
        config.data = encodedData; // Replace the original data with the encoded Base64 string
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Add the response interceptor to decrypt response data globally
instance.interceptors.response.use(
  (response) => {
    //console.log("Response received:", response); // Log the entire response

    if (response.data) {
      const encryptionKeyBase64 = "/bdLq63o8GHzO/KFiXXVmRgShpXRSS2okcRmfwNbbwM="; // The base64-encoded key from Laravel's APP_KEY
      const encryptionKey = CryptoJS.enc.Base64.parse(encryptionKeyBase64);

      try {
        //console.log("Encrypted data:", response.data);

        // Base64 decode the encrypted data
        const encryptedData = CryptoJS.enc.Base64.parse(response.data).toString(CryptoJS.enc.Utf8);
        const decodedData = JSON.parse(encryptedData);

        const iv = CryptoJS.enc.Base64.parse(decodedData.iv); // IV
        const ciphertext = CryptoJS.enc.Base64.parse(decodedData.value); // Encrypted data

        // Decrypt the ciphertext
        const decryptedBytes = CryptoJS.AES.decrypt(
          { ciphertext: ciphertext },
          encryptionKey,
          {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }
        );

        const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
        if (decryptedData) {
          //console.log("Decrypted data (UTF-8):", decryptedData);
          response.data = JSON.parse(decryptedData);
        } else {
          throw new Error("Decryption failed: No decrypted data available");
        }
      } catch (error) {
        console.error("Decryption error: ", error);
        return Promise.reject(error);
      }
    }

    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized request, please check your token:", error.response);
    }
    return Promise.reject(error);
  }
);

export default instance;
  