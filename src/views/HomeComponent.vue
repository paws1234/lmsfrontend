<template>
  <div class="min-h-screen flex flex-col">
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

      <!-- Theme toggle.  A real button, so it is reachable with Tab and
           activated with Enter/Space, and it announces its current state. -->
      <div class="flex items-center space-x-4">
        <button type="button" class="cursor-pointer bg-transparent border-0 p-2 text-yellow-500"
          :aria-pressed="darkMode" aria-label="Toggle dark mode" @click="toggleDarkMode">
          <!-- Sun icon while the light theme is active -->
          <svg v-if="!darkMode" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>

          <!-- Moon icon while the dark theme is active -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-6 h-6">
            <path d="M14.438 10.148c.19-.425-.321-.787-.748-.601A5.5 5.5 0 0 1 6.453 2.31c.186-.427-.176-.938-.6-.748a6.501 6.501 0 1 0 8.585 8.586Z" />
          </svg>
        </button>
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
import { applyTheme, initTheme, saveTheme } from "../theme";

export default {
  name: "HomeComponent",
  data() {
    return {
      // Local mirror of <html>.dark, kept only so the icons and aria-pressed
      // can re-render.  src/theme.js owns the actual preference.
      darkMode: false,
      currentYear: new Date().getFullYear(),
    };
  },
  mounted() {
    // Re-assert the theme on mount: the class is already on <html> from the
    // bootstrap, so this only pulls the value into local state.
    this.darkMode = initTheme();
  },
  methods: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      applyTheme(this.darkMode);
      saveTheme(this.darkMode);
    },
  },
};
</script>

<style scoped>
/* The theme used to be painted here, on a wrapper div.  It now lives on
   <html> as a single switch (see src/theme.js + the token block in app.css),
   so that dark mode survives navigation to every other route. */
*,
*::before,
*::after {
  box-sizing: inherit;
}
</style>
