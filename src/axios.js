import axios from "axios";
import CryptoJS from "crypto-js";

// Create an Axios instance
const instance = axios.create({
  // Base API URL; override with VUE_APP_API_BASE_URL (docker-compose sets it)
  // when the API is not on the same host as the dev server.
  baseURL: process.env.VUE_APP_API_BASE_URL || "http://localhost:8000/api",
});

// The base64-encoded key material from Laravel's APP_KEY.  The API encrypts
// every response with it (App\Http\Middleware\EncryptResponse), so the client
// has to hold the same secret to read anything back.
const ENCRYPTION_KEY_BASE64 =
  "/bdLq63o8GHzO/KFiXXVmRgShpXRSS2okcRmfwNbbwM=";

/**
 * Decrypt an API response envelope.
 *
 * `Crypt::encryptString` returns base64( JSON({iv, value}) ), with `iv` and
 * `value` themselves base64, encrypted AES-256-CBC / PKCS7.
 *
 * Returns the parsed payload, or `undefined` when the body is not a readable
 * envelope — a response the middleware left alone, an HTML error page, or
 * ciphertext this key cannot open.
 *
 * `undefined` is the failure sentinel rather than `null`, so a payload that
 * legitimately decodes to JSON `null` stays distinguishable from a failure.
 */
function decryptPayload(data) {
  if (typeof data !== "string" || data === "") return undefined;

  try {
    const encryptionKey = CryptoJS.enc.Base64.parse(ENCRYPTION_KEY_BASE64);
    const envelope = JSON.parse(
      CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8)
    );

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(envelope.value) },
      encryptionKey,
      {
        iv: CryptoJS.enc.Base64.parse(envelope.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const text = decrypted.toString(CryptoJS.enc.Utf8);
    return text ? JSON.parse(text) : undefined;
  } catch (error) {
    return undefined;
  }
}

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
    if (response.data) {
      const payload = decryptPayload(response.data);
      if (payload === undefined) {
        console.error(
          "Decryption error: response body is not a readable envelope"
        );
        return Promise.reject(new Error("Failed to decrypt response body"));
      }
      response.data = payload;
    }

    return response;
  },
  (error) => {
    // Decrypt the error body too.  Until this existed, a 401 or 404 reached the
    // caller as ciphertext, so no view could ever show the API's own wording —
    // which is why a failed login could only say "An error occurred".
    if (error.response && error.response.data) {
      const payload = decryptPayload(error.response.data);
      if (payload !== undefined) {
        error.response.data = payload;
      }
      // When the body is not a readable envelope the raw value is left on
      // error.response.data, untouched, rather than discarded.
    }

    if (error.response && error.response.status === 401) {
      console.error(
        "Unauthorized request, please check your token:",
        error.response
      );
    }
    return Promise.reject(error);
  }
);

export default instance;
  