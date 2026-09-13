import axios from "@/axios";

/**
 * Sign out.
 *
 * Local state is cleared and the redirect runs **before** anything is sent, so
 * signing out always completes — it cannot be blocked by an API that is asleep
 * (the hosted instance can take minutes to wake) or unreachable. Previously the
 * opposite order was used and any failure left the user signed in with no
 * feedback at all.
 *
 * Revoking the token server-side is then attempted best-effort. The token is
 * captured *before* storage is cleared, because the request interceptor reads it
 * from `localStorage` — clearing first would send the call out unauthenticated
 * and earn a 401. A failed revocation is logged only: leaving a token valid on
 * the server until it expires is a far better outcome than trapping someone in a
 * session they asked to leave.
 *
 * @param {import("vue-router").Router} router
 * @param {string} redirect
 */
export function performLogout(router, redirect = "/login") {
  const storedToken = localStorage.getItem("token");

  localStorage.removeItem("token");
  sessionStorage.removeItem("token");

  const headers = {};
  if (storedToken) {
    try {
      // The app stores the token base64-encoded; the interceptor decodes it the
      // same way when it builds this header itself.
      headers.Authorization = `Bearer ${atob(storedToken)}`;
    } catch (error) {
      console.error("Logout: stored token could not be decoded:", error);
    }
  }

  axios.post("/logout", {}, { headers }).catch((error) => {
    console.error(
      "Logout: could not revoke the token server-side:",
      error?.response?.data?.message || error?.message
    );
  });

  router.push(redirect);
}

export default performLogout;
