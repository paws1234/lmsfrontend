<template>
  <div
    class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-blue-50"
  >
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
      <!--
        The seal and the account glyph used to sit in an `absolute` wrapper that
        had no positioned ancestor, so they were positioned against the viewport
        rather than this card — at 390px the seal overlapped the card by ~53px,
        and at wider widths it drifted away from it. Both are ordinary flow
        content now, centred above the form.
        `size-6` was also a no-op: Tailwind 2 has no `size-*` utility (that is
        Tailwind 3.4+), so the glyph rendered at the SVG's default size. w-6/h-6
        exist and are used instead.
      -->
      <div class="flex flex-col items-center mb-4">
        <img
          class="h-24 w-24 object-contain mb-3"
          src="@/assets/img/clogo.jpg"
          alt="Cebu Technological University seal"
        />
        <span
          class="w-10 h-10 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </span>
      </div>
      <h1 class="text-2xl font-extrabold text-gray-900 mb-6 text-center">Sign in</h1>
      <form class="space-y-6" @submit.prevent="login">
        <div>
          <label for="email" class="block text-sm font-medium text-blue-900"
            >Email</label
          >
          <input
            id="email"
            v-model="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Email Address"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-blue-900"
            >Password</label
          >
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Password"
          />
        </div>
        <div>
          <button
            type="submit"
            class="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :disabled="loading"
          >
            Login
          </button>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <router-link
              to="/register"
              class="font-medium text-blue-900 hover:text-blue-500"
            >
              Register
            </router-link>
          </p>
        </div>
      </form>
      <LoadingSpinner v-if="loading" />
      <p v-if="errorMessage" class="mt-4 text-red-500 text-center">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";
import LoadingSpinner from "@/views/LoadingSpinner.vue";

export default {
  name: "LoginComponent",
  components: {
    LoadingSpinner,
  },
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      errorMessage: "",
    };
  },
  methods: {
    async login() {
      this.loading = true;
      this.errorMessage = "";
      try {
        // Send login request to the server
        const response = await axios.post("/login", {
          email: this.email,
          password: this.password,
        });

        // Manually encode the token using Base64 (Basic "encryption")
        const encodedToken = btoa(response.data.token);  // Base64 encode the token

        // Store the encoded token in localStorage
        localStorage.setItem("token", encodedToken);

        // Set token in Axios default Authorization header for future requests
        //axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

        // Navigate to the user's dashboard based on their role
        this.$router.push(`/${response.data.role}/dashboard`);
      } catch (error) {
        console.error(
          "Login error:",
          error.response?.data?.message || error.message
        );
        this.errorMessage =
          error.response?.data?.message ||
          "An error occurred. Please try again.";
        this.loading = false;
      }
    },
  },
};
</script>



<style scoped>
/* Existing styles here */
</style>
