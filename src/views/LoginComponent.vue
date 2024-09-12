<template>
  <div
    class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-extrabold text-gray-900 mb-6 text-center">
        Login to your account
      </h2>
      <form class="space-y-6" @submit.prevent="login">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700"
            >Email</label
          >
          <input
            id="email"
            v-model="email"
            name="email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Email Address"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700"
            >Password</label
          >
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Password"
          />
        </div>
        <div>
          <button
            type="submit"
            class="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
              class="font-medium text-blue-600 hover:text-blue-500"
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
        const response = await axios.post("/login", {
          email: this.email,
          password: this.password,
        });

        localStorage.setItem("token", response.data.token);
        this.$router.push(`/${response.data.role}/dashboard`);
      } catch (error) {
        console.error(
          "Login error:",
          error.response?.data?.message || error.message,
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
