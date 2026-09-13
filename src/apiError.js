/**
 * Turn a failed request into a sentence worth showing a user.
 *
 * Two things make this less obvious than it looks:
 *
 *  1. **The API is not consistent about the key.** A missing student profile is
 *     `{"message": "Student not found"}` from `ScoreController::index()` but
 *     `{"error": "Student not found"}` from `StudentDashboardController::index()`.
 *     Reading only `message` renders `undefined` for the second.
 *  2. **"The server said no" and "we never reached the server" are different
 *     problems.** With no `error.response` at all — offline, DNS failure,
 *     server down — there is no body to read, and telling the user their
 *     password was rejected would be a lie.
 *
 * Only an object body is trusted. A string body is either an unencrypted
 * response, an HTML error page, or ciphertext the interceptor could not open
 * (see `src/axios.js`) — none of which is a message anyone should read.
 */

export const NETWORK_ERROR_MESSAGE =
  "We can't reach the server. Please check your connection and try again.";

export function apiErrorMessage(
  error,
  fallback = "Something went wrong. Please try again.",
) {
  // No response object: the request never completed.
  if (!error || !error.response) {
    return NETWORK_ERROR_MESSAGE;
  }

  const data = error.response.data;

  if (data && typeof data === "object") {
    // `||` rather than `??` on purpose: an empty-string message should fall
    // through to the other key rather than be shown as a blank error.
    const message = data.message || data.error;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export default apiErrorMessage;
