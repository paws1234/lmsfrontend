<template>
  <div
    class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-blue-50 "
  >
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
      <!--
        Same defect as LoginComponent: an `absolute` wrapper with no positioned
        ancestor anywhere above it, so the seal was positioned against the
        viewport rather than this card. `sm:h-25` is also not a Tailwind 2 class
        (there is no h-25), so that breakpoint silently fell back to `md:h-28`.
        The seal is ordinary flow content now, centred.
      -->
      <div class="flex flex-col items-center mb-4">
        <img
          class="h-24 w-24 object-contain"
          src="@/assets/img/clogo.jpg"
          alt="Cebu Technological University seal"
        />
      </div>
      <h1 class="text-2xl font-extrabold text-gray-900 mb-6 text-center">
        Create Your Account
      </h1>
      <form class="space-y-6" @submit.prevent="register">
        <div>
          <label for="name" class="block text-sm font-medium text-blue-900"
            >Name</label
          >
          <input
            id="name"
            v-model="name"
            name="name"
            type="text"
            autocomplete="name"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Your Name"
          />
        </div>

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
            autocomplete="new-password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Password"
          />
        </div>

        <div>
          <label
            for="password_confirmation"
            class="block text-sm font-medium text-blue-900"
            >Confirm Password</label
          >
          <input
            id="password_confirmation"
            v-model="password_confirmation"
            name="password_confirmation"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Confirm Password"
          />
          <p v-if="passwordError" class="text-red-500 text-sm mt-1">
            {{ passwordError }}
          </p>
        </div>

        <div>
          <button
            type="submit"
            class="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Register
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <router-link
              to="/login"
              class="font-medium text-blue-600 hover:text-blue-500"
              >Login</router-link
            >
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "../axios";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      role: "student",
      password_confirmation: "",
      passwordError: "", // Add this line to define the passwordError property
    };
  },
  methods: {
    async register() {
      this.passwordError = ""; // Reset the error message before checking
      if (this.password !== this.password_confirmation) {
        this.passwordError = "Passwords do not match.";
        return;
      }
      try {
        await axios.post("/register", {
          name: this.name,
          email: this.email,
          password: this.password,
          role: this.role,
        });
        this.$router.push("/login");
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style scoped></style>
