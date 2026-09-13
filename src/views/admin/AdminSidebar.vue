<template>
  <div>
    <!-- Toggle Sidebar Button -->
    <button
      v-if="!isSidebarOpen"
      class="lg:hidden fixed top-4 left-4 z-50 p-3 text-gray-800 bg-white rounded-md border border-gray-300 shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
      @click="toggleSidebar"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </button>

    <!-- Sidebar -->
    <div
      :class="{
        'translate-x-0': isSidebarOpen,
        '-translate-x-full': !isSidebarOpen,
      }"
      class="sidebar fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-yellow-500 to-red-400 text-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:w-64 lg:flex lg:flex-col lg:static"
    >
      <!-- Sidebar content -->
      <div class="p-4">
        <!-- Sidebar Header (Logo and Admin Name) -->
        <div class="flex items-center mb-6 space-x-4">
          <img
            src="https://via.placeholder.com/50"
            alt="Admin Avatar"
            class="rounded-full h-12 w-12"
          />
          <div>
            <h2 class="text-xl font-semibold">Admin Name</h2>
            <span class="text-sm text-gray-300">Admin</span>
          </div>
        </div>

        <!-- Sidebar Links -->
        <ul class="space-y-4">
          <!-- Home Link -->
          <li>
            <router-link
              to="/admin/dashboard"
              class="flex items-center px-4 py-2 rounded-md text-black font-bold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700"
            >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 mr-2">
  <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
  <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
</svg>

              Home
            </router-link>
          </li>

          <li>
            <router-link
              to="/admin/students"
              class="flex items-center px-4 py-2 rounded-md text-black font-bold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5.121 19.121A1.5 1.5 0 015.5 17H18.5a1.5 1.5 0 01.379 2.121M15 7A3 3 0 1111 7m4 0a4 4 0 00-8 0m4 8a5.5 5.5 0 00-6 0"
                />
              </svg>
              Students
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/teachers"
              class="flex items-center px-4 py-2 rounded-md text-black font-bold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 11a4 4 0 110-8 4 4 0 010 8zm-2 1v2a4 4 0 018 0v2M5.5 20.5h13"
                />
              </svg>
              Teachers
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/courses"
              class="flex items-center px-4 py-2 rounded-md text-black font-bold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16v12H4z"
                />
              </svg>
              Courses
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/schedules"
              class="flex items-center px-4 py-2 rounded-md text-black font-bold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
            </svg>
              ComputerLab
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/event-handlers"
              class="flex items-center px-4 py-2 rounded-md text-black font-bold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
</svg>

              Events
            </router-link>
          </li>
        </ul>

        <!-- Logout Button -->
        <button
          class="mt-12 w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          @click="logout"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Overlay for sidebar on mobile -->
    <div v-if="isSidebarOpen" class="overlay lg:hidden" @click="toggleSidebar"></div>
  </div>
</template>

<script>
import { performLogout } from "@/logout";
import { useRouter } from "vue-router";
import { ref } from "vue";

export default {
  name: "AdminSidebar",
  setup() {
    const isSidebarOpen = ref(false);
    const router = useRouter();

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
    };

    // Clearing local state and redirecting is the whole job; revoking the token
    // server-side happens best-effort inside the helper.
    const logout = () => performLogout(router);

    return {
      isSidebarOpen,
      toggleSidebar,
      logout,
    };
  },
};
</script>

<style scoped>
.sidebar {
  width: 16rem;
  background-color: #2d3748;
  padding: 1rem;
  z-index: 40;
}

.overlay {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
}
</style>
