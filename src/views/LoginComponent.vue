<template>
  <div
    class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-blue-50"
  >
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-extrabold text-gray-900 mb-6 text-center">
       
       <div class="flex justify-center items-center absolute top-24 right-1/3 	md:top-5 md:right-32 sm:top-5 sm:right-12 lg:top-20 lg:right-1/3	">
  <div class="pt-3">
    <img class="h-32 " src="@/assets/img/clogo.jpg" alt="University Logo" />
  </div>
</div>


<div class=" w-32 relative left-32 text-blue-900 ">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>
        </div>

      </h2>
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
