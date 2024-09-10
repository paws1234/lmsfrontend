<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="w-full bg-yellow-600 text-white py-6 shadow-md">
      <div class="container mx-auto flex justify-center items-center px-6">
        <h1 class="text-3xl font-bold">
          Welcome to Cebu Technological University Danao Learning Management
          System
        </h1>
      </div>
    </header>

    <main class="flex-grow flex flex-col items-center justify-center">
      <section class="text-center py-12">
        <h2 class="text-4xl font-extrabold mb-4 text-gray-800">
          Empower Your Learning Journey
        </h2>
        <p class="text-lg text-gray-600 mb-8">
          Join our School's platform to access personalized learning resources
          and track your progress efficiently.
        </p>
        <div class="flex justify-center space-x-4">
          <router-link
            to="/login"
            class="inline-block bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Login
          </router-link>
          <router-link
            to="/register"
            class="inline-block bg-green-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Register
          </router-link>
        </div>
      </section>
    </main>

    <footer class="w-full bg-yellow-800 text-white py-4">
      <div class="container mx-auto text-center">
        <p>&copy; {{ currentYear }} LMS Platform. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "HomeComponent",
  data() {
    return {
      currentYear: new Date().getFullYear(),
    };
  },
};
</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
*,
*::before,
*::after {
  box-sizing: inherit;
}
</style>
