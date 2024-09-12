<template>
  <div class="flex flex-col h-screen">
    <!-- header -->
    <header class="flex relative dark:bg-black mb-5 sm:justify-center lg:justify-start">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">

      <div class="pt-3">
        <img class="h-16 pl-3" src="@/assets/img/ctulogo.jpg" />
      </div>

      <div class="pt-5 pl-4">
        <h3 class="text-yellow-500 font-semibold text-lg">
          Cebu Technological University
        </h3>
        <span class="text-sm text-blue-900 dark:text-white"
          >Learning Management System</span
        >
      </div>

      <!-- Sun Icon -->
      <div
        v-if="!darkMode"
        @click="toggleDarkMode"
        class="w-10 pt-5 text-yellow-500 relative left-10 cursor-pointer "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 sun"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      </div>

      <!-- Moon Icon -->
      <div
        v-if="darkMode"
        @click="toggleDarkMode"
        class="w-7 pt-6 text-yellow-500 relative left-10 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="size-4 moon"
        >
          <path
            d="M14.438 10.148c.19-.425-.321-.787-.748-.601A5.5 5.5 0 0 1 6.453 2.31c.186-.427-.176-.938-.6-.748a6.501 6.501 0 1 0 8.585 8.586Z"
          />
        </svg>
      </div>

      
    </header>
    <!-- header ends -->

    <!-- main content -->
    <main class="flex flex-row dark:bg-black align-items-center relative right-20 ">
      <div class="pt-24 pl-40 w-1/2  ">
        <h1
         class="text-blue-900 text-7xl font-bold dark:text-yellow-400 sm:relative sm:text-left	 sm:bottom-10 md:left-10 md:left-36 md:text-center lg:left-5" >
          Welcome to Cebu Technological University
        </h1>
       <h3 class="text-yellow-500 dark:text-blue-900 sm:relative sm:bottom-10 md:left-12 lg:left-44 md:left-40 ">
          We are delighted to have you here.
        </h3>

        <div class="flex mt-5 sm:relative sm:bottom-10 md:left-20  lg:left-44 md:left-40">
          <div class="pt-5">
            <button
              type="button"
              class="text-2xl px-6 py-2 min-w-[120px] text-white border--400 rounded bg-blue-900 focus:outline-none focus:ring"
            >
              Login
            </button>
          </div>

          <div class="pt-5 pl-4">
            <button
              type="button"
              class="text-2xl px-6 py-2 min-w-[120px] text-white border--400 rounded bg-blue-900 focus:outline-none focus:ring"
            >
              Register
            </button>
          </div>
        </div>
      </div>

      <!-- Second section with image -->
      
    <div
  class="flex-1 bg-blue-900 flex items-center justify-center h-[50vh] mb-10 hidden sm:hidden md:hidden lg:flex relative top-10 "
  style="transform: skewX(-12deg) ">

  <div class="relative w-full h-full overflow-hidden  ">
    <img
      class="object-cover w-full h-full mix-blend-overlay"
      src="@/assets/img/ctu.jpg"
      alt="CTU Image"
    />
  </div>
</div>

    </main>

    <!-- footer-->
<footer class="bg-blue-900 text-white py-6 mt-20 dark:bg-gray-800 lg:flex lg:justify-between lg:items-center ">

      <div class="container mx-auto text-center">
        <p class="text-sm">&copy; 2024 Cebu Technological University. All rights reserved.</p>
        <ul class="flex justify-center space-x-4">
          <li><a href="#" class="hover:text-gray-400">Privacy Policy</a></li>
          <li><a href="#" class="hover:text-gray-400">Terms of Service</a></li>
          <li><a href="#" class="hover:text-gray-400">Contact Us</a></li>
        </ul>
      </div>
    </footer>
    <!-- footer ends -->
  </div>
</template>

<script>
export default {
  name: "HomeComponent",
  data() {
    return {
      darkMode: false,
    };
  },
  methods: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      if (this.darkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    },
    themeCheck() {
      const userTheme = localStorage.getItem("theme");
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

      if (userTheme === "dark" || (!userTheme && systemTheme)) {
        this.darkMode = true;
        document.documentElement.classList.add("dark");
      }
    },
  },
  mounted() {
    this.themeCheck();
  },
};
</script>

