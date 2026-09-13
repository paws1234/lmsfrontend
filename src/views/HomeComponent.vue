<template>
  <div :class="{ 'dark': darkMode }" class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="flex items-center justify-between lg:justify-start dark:bg-black py-4 px-3 sm:px-6 lg:px-8">
      <!-- University Logo -->
      <div class="flex items-center space-x-4">
        <img class="h-12 sm:h-16" src="/ts2.png" alt="University Logo" />

        <!-- University Info -->
        <div>
          <h3 class="font-semibold text-sm sm:text-lg" :class="{ 'text-orange-500': !darkMode, 'text-yellow-500': darkMode }">
            Cebu Technological University
          </h3>
          <span class="text-xs sm:text-sm" :class="{ 'text-black': !darkMode, 'text-gray-300': darkMode }">
            Learning Management System
          </span>
        </div>
      </div>

      <!-- Toggle Dark Mode Icons -->
      <div class="flex items-center space-x-4">
        <!-- Sun Icon for light mode -->
        <div v-if="!darkMode" @click="toggleDarkMode" class="cursor-pointer text-yellow-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="ml-9 w-10 h-10">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
        </div>

        <!-- Moon Icon for dark mode -->
        <div v-if="darkMode" @click="toggleDarkMode" class="cursor-pointer text-yellow-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class=" ml-8 w-6 h-6">
            <path d="M14.438 10.148c.19-.425-.321-.787-.748-.601A5.5 5.5 0 0 1 6.453 2.31c.186-.427-.176-.938-.6-.748a6.501 6.501 0 1 0 8.585 8.586Z" />
          </svg>
        </div>
      </div>
    </header>
    <!-- Header ends -->

    <!-- Main Section -->
    <main class="flex-grow flex flex-col items-center justify-center px-4 lg:px-12 py-8">
      <section class="flex flex-col lg:flex-row items-center lg:justify-between w-full max-w-7xl">
        <!-- Text Section -->
        <div class="mb-8 lg:mb-0 lg:w-1/2">
          <h2 class="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4" :class="{ 'text-gray-800': !darkMode, 'text-white': darkMode }">
            Welcome to <br />
            <span class="text-yellow-500">Cebu Technological University</span><br />
            Danao - Campus
          </h2>
          <p class="text-base sm:text-lg mb-8" :class="{ 'text-gray-600': !darkMode, 'text-gray-300': darkMode }">
            We are delighted to have you here.
          </p>

          <!-- Buttons -->
          <div class="flex space-x-4">
            <router-link
              to="/login"
              class="inline-block bg-yellow-500 text-black font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
            >
              Login
            </router-link>
            <router-link
              to="/register"
              class="inline-block bg-yellow-500 text-black font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
            >
              Register
            </router-link>
          </div>
        </div>

        <!-- Image Section -->
        <div class="lg:w-1/2 flex items-center justify-center">
          <div class="relative w-full h-64 lg:h-[50vh] transform skew-x-[-12deg] overflow-hidden bg-blue-900">
            <img
              class="object-cover w-full h-full mix-blend-overlay"
              src="/test.jpg"
              alt="CTU Image"
            />
          </div>
        </div>
      </section>
    </main>

    <!-- Footer Section -->
    <footer class="bg-blue-900 text-white py-4 dark:bg-gray-800 text-center">
      <div class="container mx-auto">
        <p>&copy; {{ currentYear }} LMS Platform. All rights reserved.</p>
      </div>
    </footer>
    <!-- Footer ends -->
  </div>
</template>

<script>
export default {
  name: "HomeComponent",
  data() {
    return {
      darkMode: false, // Initialize the dark mode state
      currentYear: new Date().getFullYear(),
    };
  },
  mounted() {
    // Check localStorage for the dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode");
    this.darkMode = savedDarkMode === "true";
    document.documentElement.classList.toggle("dark", this.darkMode);
  },
  methods: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      // Apply dark mode class to the document's root element
      document.documentElement.classList.toggle("dark", this.darkMode);
      // Save the dark mode preference in localStorage
      localStorage.setItem("darkMode", this.darkMode);
    },
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

body {
  font-family: 'Inter', sans-serif;
  transition: background-color 0.5s, color 0.5s;
}

.dark {
  background-color: #121212;
  color: white;
}
</style>
